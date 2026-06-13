import { NextRequest, NextResponse } from "next/server";
import { type Prisma } from "@prisma/client";
import { customerWhere, filterCustomers, prisma, type FilterRule } from "@/lib/db";

export async function GET() {
  try {
    const segments = await prisma.segment.findMany({ orderBy: { createdAt: "desc" } });
    const result = await Promise.all(segments.map(async (segment) => ({ ...segment, matchCount: await prisma.customer.count({ where: customerWhere(segment.filterRule as FilterRule) }) })));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load segments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { name?: string; description?: string; filterRule?: FilterRule; nlQuery?: string };
    if (!body.name || !body.filterRule) return NextResponse.json({ error: "name and filterRule are required" }, { status: 400 });
    const segment = await prisma.segment.create({ data: { name: body.name, description: body.description, filterRule: body.filterRule as Prisma.InputJsonValue, nlQuery: body.nlQuery } });
    const matchCount = (await filterCustomers(body.filterRule)).length;
    return NextResponse.json({ ...segment, matchCount }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create segment" }, { status: 500 });
  }
}
