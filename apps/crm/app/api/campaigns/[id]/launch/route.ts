import { NextResponse } from "next/server";
import { filterCustomers, prisma, type FilterRule } from "@/lib/db";
import { sleep } from "@/lib/utils";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const campaign = await prisma.campaign.findUnique({ where: { id: params.id }, include: { segment: true } });
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    if (campaign.status !== "draft") return NextResponse.json({ error: "Only draft campaigns can be launched" }, { status: 409 });
    const customers = await filterCustomers(campaign.segment.filterRule as FilterRule);
    await prisma.campaignMessage.createMany({
      data: customers.map((customer) => ({
        campaignId: campaign.id,
        customerId: customer.id,
        channel: campaign.channel,
        body: campaign.messageBody.replaceAll("{{name}}", customer.name).replaceAll("{{city}}", customer.city),
      })),
      skipDuplicates: true,
    });
    const messages = await prisma.campaignMessage.findMany({ where: { campaignId: campaign.id }, include: { customer: { select: { phone: true } } } });
    await prisma.campaign.update({ where: { id: campaign.id }, data: { status: "running", totalSent: messages.length, launchedAt: new Date() } });
    const baseUrl = process.env.CHANNEL_SERVICE_URL;
    if (!baseUrl) throw new Error("CHANNEL_SERVICE_URL is not configured");
    for (let i = 0; i < messages.length; i += 50) {
      const batch = messages.slice(i, i + 50);
      await Promise.all(batch.map(async (message) => {
        const response = await fetch(`${baseUrl}/send`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messageId: message.id, recipient: message.customer.phone, body: message.body, channel: message.channel }) });
        if (!response.ok) throw new Error(`Channel rejected message ${message.id}`);
      }));
      if (i + 50 < messages.length) await sleep(100);
    }
    return NextResponse.json({ launched: true, totalSent: messages.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to launch campaign" }, { status: 500 });
  }
}
