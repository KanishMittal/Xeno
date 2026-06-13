import "dotenv/config";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { simulateDelivery } from "./simulator.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/health", (_request, response) => response.json({ status: "ok", service: "channel-service" }));

app.post("/send", (request, response) => {
  const { messageId, recipient, body, channel } = request.body as Record<string, unknown>;
  if (![messageId, recipient, body, channel].every((value) => typeof value === "string" && value.length > 0)) {
    response.status(400).json({ error: "messageId, recipient, body and channel are required" });
    return;
  }
  response.status(202).json({ accepted: true });
  void simulateDelivery(messageId as string, channel as string).catch((error) => console.error(`[${messageId}] simulation failed`, error));
});

app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
  console.error(error);
  response.status(500).json({ error: "Internal channel service error" });
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`Channel service listening on port ${port}`));

// Self-ping every 14 minutes to prevent Render spin-down
setInterval(async () => {
  try {
    await fetch(`https://xeno-zara-studio.onrender.com/health`);
    console.log("[keepalive] pinged health endpoint");
  } catch (e) {
    console.error("[keepalive] ping failed");
  }
}, 14 * 60 * 1000);