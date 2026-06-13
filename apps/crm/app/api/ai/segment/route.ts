import { NextRequest, NextResponse } from "next/server";
import { customerWhere, prisma } from "@/lib/db";
import { nlToSegmentFilter } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json() as { query?: string };
    if (!query) return NextResponse.json({ error: "query is required" }, { status: 400 });
    const filterRule = await nlToSegmentFilter(query);
    const where = customerWhere(filterRule);
    const [count, sample] = await Promise.all([prisma.customer.count({ where }), prisma.customer.findMany({ where, take: 5, orderBy: { totalSpend: "desc" } })]);
    return NextResponse.json({ filterRule, preview: { count, sample } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate segment" }, { status: 500 });
  }
}
