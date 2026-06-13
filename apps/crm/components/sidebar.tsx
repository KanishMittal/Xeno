"use client";

import { BarChart3, LayoutDashboard, Megaphone, Tags, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/segments", label: "Segments", icon: Tags },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
];

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-zinc-950 p-5 md:block">
    <div className="mb-9 flex items-center gap-3 text-lg font-semibold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-600"><BarChart3 size={19} /></span>Zara Studio</div>
    <nav className="space-y-1">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white", pathname.startsWith(href) && "bg-zinc-900 text-white")}><Icon size={18} />{label}</Link>)}</nav>
  </aside>;
}
