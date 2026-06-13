import { DashboardChart } from "@/components/dashboard-chart";
import { Badge, Card, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [customers, campaigns, aggregate, recent] = await Promise.all([
    prisma.customer.count(), prisma.campaign.count(), prisma.campaign.aggregate({ _sum: { totalSent: true, delivered: true } }),
    prisma.campaign.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { segment: true } }),
  ]);
  const sent = aggregate._sum.totalSent ?? 0;
  const delivered = aggregate._sum.delivered ?? 0;
  const stats = [["Total Customers", customers], ["Total Campaigns", campaigns], ["Messages Sent", sent], ["Avg Delivery Rate", `${sent ? Math.round(delivered / sent * 100) : 0}%`]];
  return <><PageHeader title="Dashboard" description="A live view of your customer engagement." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value]) => <Card key={label}><p className="text-sm text-muted">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></Card>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-5"><Card className="xl:col-span-3"><h2 className="mb-5 font-semibold">Messages per campaign</h2><DashboardChart data={recent.map((item) => ({ name: item.name.slice(0, 16), sent: item.totalSent }))} /></Card>
      <Card className="xl:col-span-2"><h2 className="mb-4 font-semibold">Recent campaigns</h2><div className="space-y-4">{recent.length ? recent.map((item) => <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0"><div><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-muted">{item.segment.name}</p></div><div className="text-right"><Badge>{item.status}</Badge><p className="mt-1 text-xs text-muted">{item.totalSent ? Math.round(item.delivered / item.totalSent * 100) : 0}% delivered</p></div></div>) : <p className="text-sm text-muted">No campaigns yet.</p>}</div></Card></div>
  </>;
}
