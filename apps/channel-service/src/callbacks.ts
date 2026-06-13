export type DeliveryEvent = "sent" | "delivered" | "failed" | "opened" | "clicked";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fireCallback(messageId: string, event: DeliveryEvent) {
  const url = process.env.CRM_RECEIPT_URL;
  if (!url) {
    console.error(`[${messageId}] ${event}: CRM_RECEIPT_URL is not configured`);
    return;
  }
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      console.log(`[callback] firing ${event} for ${messageId} to ${url}`);
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messageId, event, timestamp: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error(`CRM returned ${response.status}`);
      console.log(`[callback] ${event} for ${messageId} → 200 OK`);
      return;
    } catch (error) {
      console.error(`[callback] FAILED ${event} for ${messageId}:`, error instanceof Error ? error.message : String(error));
      if (attempt < 2) await sleep(1000 * 2 ** attempt);
    }
  }
}
