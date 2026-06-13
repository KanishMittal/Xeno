import { NextRequest, NextResponse } from "next/server";
import { receiptQueue, type ReceiptEvent } from "@/lib/queue";

const events = new Set(["sent", "delivered", "opened", "clicked", "failed"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<ReceiptEvent>;
    const { messageId, event, timestamp } = body;
    if (!messageId || !event || !timestamp || !events.has(event)) {
      return NextResponse.json({ error: "Invalid receipt payload" }, { status: 400 });
    }
    console.log(`[receipt] received ${event} for ${messageId}`);
    if (!receiptQueue) {
      return NextResponse.json({ error: "REDIS_URL is not configured" }, { status: 503 });
    }
    await receiptQueue.add("receipt-event", { messageId, event, timestamp } as ReceiptEvent, {
      attempts: 5,
      backoff: { type: "exponential", delay: 1000 },
      removeOnComplete: 1000,
    });
    return NextResponse.json({ accepted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to accept receipt" }, { status: 500 });
  }
}
