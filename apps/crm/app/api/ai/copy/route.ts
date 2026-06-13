import { NextRequest, NextResponse } from "next/server";
import { filterCustomers, prisma, type FilterRule } from "@/lib/db";
import { generateMessageCopy } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { segmentId, channel } = await request.json() as { segmentId?: string; channel?: string };
    if (!segmentId || !channel) return NextResponse.json({ error: "segmentId and channel are required" }, { status: 400 });
    const segment = await prisma.segment.findUnique({ where: { id: segmentId } });
    if (!segment) return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    const customers = (await filterCustomers(segment.filterRule as FilterRule)).slice(0, 3);
    const samples = await Promise.all(customers.map(async (customer) => {
      const order = await prisma.order.findFirst({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" } });
      return { name: customer.name, city: customer.city, lastCategory: order?.category ?? "fashion" };
    }));
    const copy = await generateMessageCopy({ brandName: "Zara Studio", segmentDescription: segment.description ?? segment.name, channel, sampleCustomers: samples });
    return NextResponse.json({ copy });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate copy" }, { status: 500 });
  }
}
