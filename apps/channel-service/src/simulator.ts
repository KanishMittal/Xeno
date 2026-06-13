import { fireCallback } from "./callbacks.js";

export const DELIVERY_RATE = 0.9;
export const OPEN_RATE = 0.6;
export const CLICK_RATE = 0.35;

const delay = (min: number, max: number) => new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

export async function simulateDelivery(messageId: string, channel: string) {
  console.log(`[${messageId}] simulating ${channel} delivery`);
  await delay(200, 600);
  await fireCallback(messageId, "sent");
  await delay(300, 1000);
  if (Math.random() > DELIVERY_RATE) {
    await fireCallback(messageId, "failed");
    return;
  }
  await fireCallback(messageId, "delivered");
  await delay(500, 1500);
  if (Math.random() > OPEN_RATE) return;
  await fireCallback(messageId, "opened");
  await delay(300, 800);
  if (Math.random() <= CLICK_RATE) await fireCallback(messageId, "clicked");
}
