import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { receiptQueue, type ReceiptEvent } from "@/lib/queue";

const events = new Set(["sent", "delivered", "opened", "clicked", "failed"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<ReceiptEvent>;
    if (!body.messageId || !body.event || !body.timestamp || !events.has(body.event)) return NextResponse.json({ error: "Invalid receipt payload" }, { status: 400 });
    if (!receiptQueue) return NextResponse.json({ error: "REDIS_URL is not configured" }, { status: 503 });
    const exists = await prisma.campaignMessage.findUnique({ where: { id: body.messageId }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    await receiptQueue.add("process-receipt", body as ReceiptEvent, { attempts: 5, backoff: { type: "exponential", delay: 1000 }, removeOnComplete: 1000 });
    return NextResponse.json({ accepted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to accept receipt" }, { status: 500 });
  }
}
