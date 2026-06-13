import { Queue, Worker, type ConnectionOptions, type Job, type JobsOptions } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "@/lib/db";

export type ReceiptEvent = { messageId: string; event: "sent" | "delivered" | "opened" | "clicked" | "failed"; timestamp: string };
const url = process.env.REDIS_URL;
// const connection = url ? new IORedis(url, { maxRetriesPerRequest: null }) : null;
const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  tls: {
    rejectUnauthorized: false,
  },
});
const bullConnection = connection as unknown as ConnectionOptions;

interface ReceiptQueue {
  add(name: string, data: ReceiptEvent, options?: JobsOptions): Promise<unknown>;
}
export const receiptQueue: ReceiptQueue | null = connection ? new Queue("receipt-events", { connection: bullConnection }) as unknown as ReceiptQueue : null;
const globalWorker = globalThis as unknown as { receiptWorker?: Worker<ReceiptEvent> };

async function processReceipt(job: Job<ReceiptEvent>) {
  const { messageId, event, timestamp } = job.data;
  const message = await prisma.campaignMessage.findUnique({ where: { id: messageId } });
  if (!message) throw new Error(`Unknown message ${messageId}`);
  const field = event === "sent" ? "sentAt" : event === "failed" ? null : `${event}At`;
  const alreadyProcessed = field ? message[field as "sentAt" | "deliveredAt" | "openedAt" | "clickedAt"] : message.status === "failed";
  if (alreadyProcessed) return;
  const eventDate = new Date(timestamp);
  await prisma.$transaction([
    prisma.campaignMessage.update({ where: { id: messageId }, data: { status: event, ...(field ? { [field]: eventDate } : {}) } }),
    ...(event !== "sent" ? [prisma.campaign.update({ where: { id: message.campaignId }, data: { [event]: { increment: 1 } } })] : []),
  ]);
  const pending = await prisma.campaignMessage.count({ where: { campaignId: message.campaignId, status: { in: ["queued", "sent"] } } });
  if (pending === 0) await prisma.campaign.update({ where: { id: message.campaignId }, data: { status: "completed", completedAt: new Date() } });
}

export function startReceiptWorker() {
  if (!connection || globalWorker.receiptWorker) return;
  globalWorker.receiptWorker = new Worker<ReceiptEvent>("receipt-events", processReceipt, { connection: bullConnection, concurrency: 10 });
  globalWorker.receiptWorker.on("failed", (job, error) => console.error("Receipt job failed", job?.id, error));
}
