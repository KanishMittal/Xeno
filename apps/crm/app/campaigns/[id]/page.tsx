import { notFound } from "next/navigation";
import { CampaignLive } from "@/components/campaign-live";
import { campaignAnalytics } from "@/lib/db";

export const dynamic = "force-dynamic";
export default async function CampaignPage({ params }: { params: { id: string } }) {
  const campaign = await campaignAnalytics(params.id);
  if (!campaign) notFound();
  return <CampaignLive initial={campaign} />;
}
