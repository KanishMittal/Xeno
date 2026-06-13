# Tradeoffs

## Demo scope

The implementation assumes roughly 500 customers and about 5 campaigns. At that size, live segment counts, direct Prisma reads, and creating campaign message rows in one request are simple and responsive.

## At 1M customers

- Replace offset pagination with cursor-based pagination backed by stable indexed fields.
- Compute large segments asynchronously and persist audience snapshots rather than evaluating every filter during launch.
- Cache segment counts and invalidate them when customer aggregates change.
- Stream message creation into partitioned jobs and shard queues by campaign or tenant.
- Separate receipt workers from the Next.js runtime and autoscale them independently.
- Use bulk aggregate updates or an event warehouse for analytics instead of transactional counters alone.

## Why Redis queues for callbacks

Callbacks arrive in bursts and should receive a fast response. Redis-backed jobs decouple ingestion from database work, absorb spikes, and provide retry behavior when PostgreSQL is temporarily unavailable.

## Why BullMQ over raw Redis pub/sub

BullMQ provides persistent jobs, acknowledgements, retries, backoff, concurrency controls, and operational tooling. Raw Redis pub/sub drops events when consumers are offline and offers no built-in job lifecycle or retry semantics.

## Known tradeoffs

- A Next.js instrumentation worker is convenient for the requested deployment shape, but a dedicated worker service is more reliable at scale because serverless instances may suspend.
- Campaign completion uses the latest known message states; real channel providers usually expose explicit finalization windows because opens and clicks can arrive much later.
- The channel simulator is intentionally stateless. A production channel adapter would authenticate requests, persist provider IDs, enforce rate limits, and verify signed callbacks.
