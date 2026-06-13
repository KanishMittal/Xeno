import { NextResponse } from "next/server";
import { campaignAnalytics } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const campaign = await campaignAnalytics(params.id);
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    return NextResponse.json(campaign);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load campaign" }, { status: 500 });
  }
}
