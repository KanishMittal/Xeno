import Link from "next/link";
import { Badge, Button, Card, Empty, PageHeader } from "@/components/ui";
import { customerWhere, prisma, type FilterRule } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export default async function SegmentsPage() {
  const segments = await prisma.segment.findMany({ orderBy: { createdAt: "desc" } });
  const rows = await Promise.all(segments.map(async (segment) => ({ ...segment, count: await prisma.customer.count({ where: customerWhere(segment.filterRule as FilterRule) }) })));
  return <><PageHeader title="Segments" description="Reusable audiences powered by customer behavior." action={<Link href="/segments/new"><Button>Create segment</Button></Link>} />{rows.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((segment) => <Card key={segment.id}><div className="flex justify-between"><h2 className="font-semibold">{segment.name}</h2><Badge>{segment.count} shoppers</Badge></div><p className="mt-2 min-h-10 text-sm text-muted">{segment.description ?? segment.nlQuery ?? "Manual filters"}</p><p className="mt-4 text-xs text-muted">Created {formatDate(segment.createdAt)}</p></Card>)}</div> : <Empty>No segments yet. Create your first audience.</Empty>}</>;
}
