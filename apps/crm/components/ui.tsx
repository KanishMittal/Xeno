import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border bg-card p-5 shadow-sm", className)} {...props} />;
}

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-50", className)} {...props} />;
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium capitalize text-zinc-200", className)}>{children}</span>;
}

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="mb-7 flex items-start justify-between gap-4"><div><h1 className="text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-1 text-sm text-muted">{description}</p></div>{action}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <Card className="py-12 text-center text-muted">{children}</Card>;
}
