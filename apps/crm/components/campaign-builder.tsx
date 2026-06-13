"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/components/ui";

interface SegmentOption { id: string; name: string; matchCount: number }
export function CampaignBuilder({ segments }: { segments: SegmentOption[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1); const [segmentId, setSegmentId] = useState(segments[0]?.id ?? ""); const [channel, setChannel] = useState("whatsapp"); const [body, setBody] = useState(""); const [name, setName] = useState(""); const [loading, setLoading] = useState(false);
  const segment = segments.find((item) => item.id === segmentId);
  // async function generate() { setLoading(true); const data = await fetch("/api/ai/copy", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ segmentId, channel }) }).then((r) => r.json()) as { copy: string }; setBody(data.copy); setLoading(false); }
  const generate = async () => {
  setLoading(true);
  try {
    const res = await fetch("/api/ai/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segmentId, channel }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("AI copy error:", err);
      alert("Failed to generate copy: " + (err.error || res.status));
      return;
    }

    const data = await res.json();
    if (data.copy) {
      setBody(data.copy);
    } else {
      console.error("Unexpected response:", data);
      alert("AI returned an unexpected response. Check console.");
    }
  } catch (e) {
    console.error("Generate failed:", e);
    alert("Network error calling AI copy endpoint.");
  } finally {
    setLoading(false);
  }
};
  async function launch() { setLoading(true); const campaign = await fetch("/api/campaigns", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, segmentId, messageBody: body, channel }) }).then((r) => r.json()) as { id: string }; await fetch(`/api/campaigns/${campaign.id}/launch`, { method: "POST" }); router.push(`/campaigns/${campaign.id}`); }
  return <div className="mx-auto max-w-3xl"><div className="mb-6 flex items-center justify-between text-sm text-muted">{[1, 2, 3].map((item) => <span key={item} className={step === item ? "text-rose-400" : ""}>Step {item}</span>)}</div>
    {step === 1 && <Card><h2 className="mb-4 text-lg font-semibold">Select audience</h2><select className="w-full" value={segmentId} onChange={(e) => setSegmentId(e.target.value)}>{segments.map((item) => <option value={item.id} key={item.id}>{item.name} ({item.matchCount} shoppers)</option>)}</select><Button className="mt-5" disabled={!segmentId} onClick={() => setStep(2)}>Continue</Button></Card>}
    {step === 2 && <Card><h2 className="mb-4 text-lg font-semibold">Compose message</h2><div className="mb-4 flex gap-2">{["whatsapp", "sms", "email"].map((item) => <Button key={item} className={channel === item ? "" : "bg-zinc-800"} onClick={() => setChannel(item)}>{item}</Button>)}</div><textarea className="min-h-36 w-full" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Hi {{name}}, fresh styles just landed in {{city}}..." /><div className="mt-2 flex justify-between text-xs text-muted"><span>Variables: {"{{name}}"} {"{{city}}"}</span><span>{(body ?? "").length}/160</span></div><div className="mt-4 flex gap-2"><Button className="bg-zinc-800" disabled={loading} onClick={generate}>Generate with AI</Button><Button disabled={!body} onClick={() => setStep(3)}>Review</Button></div></Card>}
    {step === 3 && <Card><h2 className="mb-4 text-lg font-semibold">Review and launch</h2><div className="mb-5 space-y-3 text-sm"><p className="flex justify-between"><span className="text-muted">Segment</span><span>{segment?.name} <Badge>{segment?.matchCount} people</Badge></span></p><p className="flex justify-between"><span className="text-muted">Channel</span><span className="capitalize">{channel}</span></p><div className="rounded-lg bg-zinc-900 p-4">{body.replace("{{name}}", "Aditi").replace("{{city}}", "Mumbai")}</div></div><input className="w-full" value={name} onChange={(e) => setName(e.target.value)} placeholder="Campaign name" /><Button className="mt-4 w-full" disabled={!name || loading} onClick={launch}>{loading ? "Launching..." : "Launch Campaign"}</Button></Card>}</div>;
}
