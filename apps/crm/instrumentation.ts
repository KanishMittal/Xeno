export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startReceiptWorker } = await import("@/lib/queue");
    startReceiptWorker();
  }
}
