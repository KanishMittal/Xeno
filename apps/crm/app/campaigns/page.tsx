import Link from "next/link";
import { Badge, Button, Card, Empty, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({ include: { segment: true }, orderBy: { createdAt: "desc" } });
  return <><PageHeader title="Campaigns" description="Create, launch, and measure personalized outreach." action={<Link href="/campaigns/new"><Button>New campaign</Button></Link>} />{campaigns.length ? <Card className="overflow-x-auto p-0"><table className="w-full text-left text-sm"><thead className="border-b bg-zinc-950 text-muted"><tr>{["Campaign", "Segment", "Channel", "Status", "Sent", "Delivery rate", "Created"].map((item) => <th className="px-4 py-3" key={item}>{item}</th>)}</tr></thead><tbody>{campaigns.map((campaign) => <tr className="border-b hover:bg-zinc-900" key={campaign.id}><td className="px-4 py-3 font-medium"><Link href={`/campaigns/${campaign.id}`}>{campaign.name}</Link></td><td className="px-4">{campaign.segment.name}</td><td className="px-4 capitalize">{campaign.channel}</td><td className="px-4"><Badge>{campaign.status}</Badge></td><td className="px-4">{campaign.totalSent}</td><td className="px-4">{campaign.totalSent ? Math.round(campaign.delivered / campaign.totalSent * 100) : 0}%</td><td className="px-4">{formatDate(campaign.createdAt)}</td></tr>)}</tbody></table></Card> : <Empty>No campaigns yet. Turn a segment into your first campaign.</Empty>}</>;
}
