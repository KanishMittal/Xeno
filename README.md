# Zara Studio AI-native Mini CRM

Zara Studio CRM is a production-ready demo for intelligent fashion retail outreach. It ingests customer and order data, builds behavioral audiences manually or with Gemini, launches personalized campaigns through a simulated channel, and turns asynchronous delivery events into live analytics.

## Architecture

```text
Marketer
   |
   v
Next.js CRM (Vercel) -----> Gemini 1.5 Flash
   |        |
   |        +-----> BullMQ receipt queue -----> Worker
   |                         |                    |
   v                         v                    v
Neon PostgreSQL          Upstash Redis       Prisma updates
   ^
   |
Express Channel Service (Railway)
   | simulate sent/delivered/opened/clicked
   +---------------- POST /api/receipts
```

## Local setup

1. Install Node.js 20+ and pnpm 9+.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy `.env.example` values into `apps/crm/.env.local` and `apps/channel-service/.env`.
4. Add valid Neon PostgreSQL, Upstash Redis, and Google AI Studio credentials.
5. Initialize and seed the database:
   ```bash
   pnpm db:push
   pnpm db:seed
   ```
6. Start both services:
   ```bash
   pnpm dev
   ```
7. Open `http://localhost:3000`. The channel service health check is at `http://localhost:3001/health`.

## How to use

Create a segment from **Segments**, either with manual filters or a natural-language prompt. Create a campaign, choose the segment, generate or write personalized copy, and launch it. Open the campaign detail page to watch simulated delivery, open, and click events update the funnel.

## Design decisions

- Next.js server components fetch dashboards and lists directly through Prisma; client components are limited to forms and live views.
- Receipt callbacks enter BullMQ and return immediately, keeping the callback endpoint responsive during bursts.
- Campaign sends are batched in groups of 50 with a short pause to protect the downstream channel.
- Message event timestamps make queue processing idempotent when callbacks retry.
- The local UI primitives follow shadcn/ui's composable model while keeping the demo's component surface intentionally small.

## Deployment

- **CRM:** Import the repository in Vercel, set the root directory to `apps/crm`, and configure the CRM environment variables.
- **Channel service:** Deploy `apps/channel-service` to Railway, configure `CRM_RECEIPT_URL` to the Vercel receipt endpoint, and set `CHANNEL_SERVICE_URL` in Vercel to the Railway service URL.
- Run `pnpm db:push` once against the production Neon database.

## At scale

For substantially larger audiences, segment evaluation and message creation should become background jobs, customer pagination should use cursors, and campaigns should be partitioned across queue workers. See [TRADEOFFS.md](TRADEOFFS.md) for the explicit scaling plan.
