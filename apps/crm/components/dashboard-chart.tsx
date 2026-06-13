"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DashboardChart({ data }: { data: { name: string; sent: number }[] }) {
  return <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid stroke="#27272a" vertical={false} /><XAxis dataKey="name" stroke="#71717a" fontSize={12} /><YAxis stroke="#71717a" fontSize={12} /><Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }} /><Bar dataKey="sent" fill="#e11d48" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}
