"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface Message { id: string; status: string; body: string; sentAt: string | Date | null; deliveredAt: string | Date | null; customer: { name: string; city: string } }
interface CampaignData { id: string; name: string; status: string; channel: string; launchedAt: string | Date | null; totalSent: number; delivered: number; failed: number; opened: number; clicked: number; messages: Message[]; topCities: { city: string; count: number }[] }

export function CampaignLive({ initial }: { initial: CampaignData }) {
  const [campaign, setCampaign] = useState(initial);
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (campaign.status !== "running") return;
    const timer = setInterval(() => {
      void fetch(`/api/campaigns/${campaign.id}/stats`)
        .then((r) => r.json())
        .then((data: { delivered: number; failed: number; opened: number; clicked: number; totalSent: number; status: string }) => {
          setCampaign((prev) => ({
            ...prev,
            delivered: data.delivered,
            failed: data.failed,
            opened: data.opened,
            clicked: data.clicked,
            totalSent: data.totalSent,
            status: data.status,
          }));
        });
    }, 5000);
    return () => clearInterval(timer);
  }, [campaign.id, campaign.status]);
  async function generateInsights() { setLoading(true); const data = await fetch("/api/ai/insights", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ campaignId: campaign.id }) }).then((r) => r.json()) as { insights: string }; setInsights(data.insights); setLoading(false); }
  const stats = [["Sent", campaign.totalSent], ["Delivered", campaign.delivered], ["Failed", campaign.failed], ["Opened", campaign.opened], ["Clicked", campaign.clicked]];
  const rate = campaign.totalSent ? Math.round(campaign.delivered / campaign.totalSent * 100) : 0;
  return <><div className="mb-7 flex items-start justify-between"><div><div className="flex items-center gap-3"><h1 className="text-3xl font-semibold">{campaign.name}</h1><Badge>{campaign.status}</Badge></div><p className="mt-2 text-sm capitalize text-muted">{campaign.channel} · Launched {formatDate(campaign.launchedAt)}</p></div><Button disabled={loading || !campaign.totalSent} onClick={generateInsights}>Generate Insights</Button></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{stats.map(([label, value]) => <Card key={label}><p className="text-sm text-muted">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></Card>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-3"><Card className="xl:col-span-2"><div className="mb-6 flex items-end justify-between"><h2 className="font-semibold">Delivery funnel</h2><p className="text-4xl font-semibold text-rose-400">{rate}%<small className="ml-2 text-sm text-muted">delivery rate</small></p></div><div className="space-y-4">{stats.slice(0, 5).map(([label, value]) => { const width = campaign.totalSent ? Number(value) / campaign.totalSent * 100 : 0; return <div key={label}><div className="mb-1 flex justify-between text-xs text-muted"><span>{label}</span><span>{value}</span></div><div className="h-2 rounded-full bg-zinc-800"><div className="h-2 rounded-full bg-rose-600" style={{ width: `${Math.min(100, width)}%` }} /></div></div>; })}</div></Card>
      <Card><h2 className="font-semibold">Top cities</h2><div className="mt-4 space-y-3">{campaign.topCities.map((item) => <div className="flex justify-between text-sm" key={item.city}><span>{item.city}</span><span className="text-muted">{item.count}</span></div>)}</div></Card></div>
    {insights && <Card className="mt-6 border-rose-900 bg-rose-950/20"><p className="text-xs font-semibold uppercase tracking-wider text-rose-400">AI analysis</p><p className="mt-2 text-sm leading-6">{insights}</p></Card>}
    <Card className="mt-6 overflow-x-auto p-0"><h2 className="p-5 font-semibold">Recent messages</h2><table className="w-full text-left text-sm"><thead className="border-y bg-zinc-950 text-muted"><tr>{["Customer", "City", "Message", "Status", "Updated"].map((item) => <th className="px-4 py-3" key={item}>{item}</th>)}</tr></thead><tbody>{campaign.messages.map((message) => <tr className="border-b" key={message.id}><td className="px-4 py-3">{message.customer.name}</td><td className="px-4">{message.customer.city}</td><td className="max-w-xs truncate px-4 text-muted">{message.body}</td><td className="px-4"><Badge>{message.status}</Badge></td><td className="px-4">{formatDate(message.deliveredAt ?? message.sentAt)}</td></tr>)}</tbody></table></Card>
  </>;
}
