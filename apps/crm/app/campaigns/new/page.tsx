import { CampaignBuilder } from "@/components/campaign-builder";
import { PageHeader } from "@/components/ui";
import { customerWhere, prisma, type FilterRule } from "@/lib/db";

export const dynamic = "force-dynamic";
export default async function NewCampaignPage() {
  const segments = await prisma.segment.findMany({ orderBy: { createdAt: "desc" } });
  const options = await Promise.all(segments.map(async (item) => ({ id: item.id, name: item.name, matchCount: await prisma.customer.count({ where: customerWhere(item.filterRule as FilterRule) }) })));
  return <><PageHeader title="New campaign" description="Choose an audience, create the message, and launch." /><CampaignBuilder segments={options} /></>;
}
