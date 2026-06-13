import { NextRequest, NextResponse } from "next/server";
import { customerWhere, prisma, type FilterRule } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { filterRule } = await request.json() as { filterRule?: FilterRule };
    if (!filterRule) return NextResponse.json({ error: "filterRule is required" }, { status: 400 });
    const where = customerWhere(filterRule);
    const [count, sample] = await Promise.all([prisma.customer.count({ where }), prisma.customer.findMany({ where, take: 5, orderBy: { totalSpend: "desc" } })]);
    return NextResponse.json({ count, sample });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to preview segment" }, { status: 500 });
  }
}
