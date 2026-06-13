import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      select: {
        delivered: true,
        failed: true,
        opened: true,
        clicked: true,
        totalSent: true,
        status: true,
      },
    });
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    return NextResponse.json(campaign);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load stats" }, { status: 500 });
  }
}
