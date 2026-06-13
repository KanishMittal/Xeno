import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json(await prisma.campaign.findMany({ include: { segment: true }, orderBy: { createdAt: "desc" } }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load campaigns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { name?: string; segmentId?: string; messageBody?: string; channel?: string };
    if (!body.name || !body.segmentId || !body.messageBody || !body.channel) return NextResponse.json({ error: "name, segmentId, messageBody and channel are required" }, { status: 400 });
    const campaign = await prisma.campaign.create({ data: { name: body.name, segmentId: body.segmentId, messageBody: body.messageBody, channel: body.channel, status: "draft" } });
    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create campaign" }, { status: 500 });
  }
}
