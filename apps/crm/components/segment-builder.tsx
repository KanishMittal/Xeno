"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { FilterRule } from "@/lib/db";

interface Sample { id: string; name: string; city: string; totalSpend: number }
const options = { cities: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Jaipur"], categories: ["tops", "bottoms", "footwear", "accessories", "dresses"], ageGroups: ["18-24", "25-34", "35-44", "45+"] };

export function SegmentBuilder() {
  const router = useRouter();
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [rule, setRule] = useState<FilterRule>({});
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<{ count: number; sample: Sample[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const setNumber = (key: keyof FilterRule, value: string) => setRule({ ...rule, [key]: value ? Number(value) : undefined });
  const toggle = (key: "cities" | "categories" | "ageGroups", value: string) => setRule({ ...rule, [key]: rule[key]?.includes(value) ? rule[key]?.filter((item) => item !== value) : [...(rule[key] ?? []), value] });
  async function runPreview() { setLoading(true); const data = await fetch("/api/segments/preview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ filterRule: rule }) }).then((r) => r.json()) as { count: number; sample: Sample[] }; setPreview(data); setLoading(false); }
  async function askAi() { setLoading(true); const data = await fetch("/api/ai/segment", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query }) }).then((r) => r.json()) as { filterRule: FilterRule; preview: { count: number; sample: Sample[] } }; setRule(data.filterRule); setPreview(data.preview); setLoading(false); }
  async function save() { if (!name) return; setLoading(true); await fetch("/api/segments", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, filterRule: rule, nlQuery: mode === "ai" ? query : undefined }) }); router.push("/segments"); router.refresh(); }
  return <div className="grid gap-6 xl:grid-cols-5"><Card className="xl:col-span-3"><div className="mb-6 flex gap-2">{(["manual", "ai"] as const).map((item) => <Button key={item} onClick={() => setMode(item)} className={mode === item ? "" : "bg-zinc-800"}>{item === "manual" ? "Manual filters" : "Ask AI"}</Button>)}</div>
    {mode === "ai" ? <><textarea className="min-h-32 w-full" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Customers in Mumbai who spent over ₹3000 but haven't bought in 60 days" /><Button className="mt-3" disabled={!query || loading} onClick={askAi}>Generate Segment</Button></> :
      <div className="space-y-5"><div className="grid grid-cols-2 gap-3">{(["minSpend", "maxSpend", "minOrders", "inactiveDays"] as const).map((key) => <label className="text-sm capitalize" key={key}>{key.replace(/([A-Z])/g, " $1")}<input className="mt-1 w-full" type="number" value={rule[key] ?? ""} onChange={(e) => setNumber(key, e.target.value)} /></label>)}</div>
      {(Object.keys(options) as (keyof typeof options)[]).map((key) => <div key={key}><p className="mb-2 text-sm capitalize text-muted">{key}</p><div className="flex flex-wrap gap-2">{options[key].map((value) => <button key={value} onClick={() => toggle(key, value)} className={`rounded-full border px-3 py-1 text-xs capitalize ${rule[key]?.includes(value) ? "border-rose-500 bg-rose-500/15 text-rose-300" : "text-muted"}`}>{value}</button>)}</div></div>)}
      <label className="block text-sm">Gender<select className="mt-1 block w-full" value={rule.gender ?? "any"} onChange={(e) => setRule({ ...rule, gender: e.target.value })}><option>any</option><option>female</option><option>male</option></select></label><Button disabled={loading} onClick={runPreview}>Preview Segment</Button></div>}
  </Card><div className="space-y-6 xl:col-span-2"><Card><h2 className="font-semibold">Translated filters</h2><div className="mt-3 flex flex-wrap gap-2">{Object.entries(rule).map(([key, value]) => <Badge key={key}>{key}: {Array.isArray(value) ? value.join(", ") : String(value)}</Badge>)}</div></Card><Card><h2 className="font-semibold">{preview ? `${preview.count} matching shoppers` : "Preview"}</h2><div className="mt-3 space-y-2">{preview?.sample.map((customer) => <div className="flex justify-between text-sm" key={customer.id}><span>{customer.name}<small className="block text-muted">{customer.city}</small></span><span>{formatCurrency(customer.totalSpend)}</span></div>)}</div></Card><Card><label className="text-sm">Segment name<input className="mt-1 w-full" value={name} onChange={(e) => setName(e.target.value)} placeholder="High-value Mumbai shoppers" /></label><Button className="mt-3 w-full" disabled={!name || !preview || loading} onClick={save}>Save Segment</Button></Card></div></div>;
}
