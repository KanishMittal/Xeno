import { NextRequest, NextResponse } from "next/server";
import { campaignAnalytics } from "@/lib/db";
import { generateCampaignInsights } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { campaignId } = await request.json() as { campaignId?: string };
    if (!campaignId) return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
    const campaign = await campaignAnalytics(campaignId);
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    const insights = await generateCampaignInsights({ campaignName: campaign.name, totalSent: campaign.totalSent, delivered: campaign.delivered, failed: campaign.failed, opened: campaign.opened, clicked: campaign.clicked, topCities: campaign.topCities, channel: campaign.channel });
    return NextResponse.json({ insights });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate insights" }, { status: 500 });
  }
}
