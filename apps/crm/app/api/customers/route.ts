import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const search = params.get("search")?.trim();
    const city = params.get("city")?.trim();
    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 20));
    const where = {
      city: city || undefined,
      OR: search ? [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }] : undefined,
    };
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { totalSpend: "desc" }, include: { orders: { orderBy: { createdAt: "desc" } } } }),
      prisma.customer.count({ where }),
    ]);
    return NextResponse.json({ customers, total, page });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load customers" }, { status: 500 });
  }
}
