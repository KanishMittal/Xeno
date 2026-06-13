import "./globals.css";
import type { Metadata } from "next";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = { title: "Zara Studio CRM", description: "AI-native customer engagement" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="dark"><body><Sidebar /><main className="min-h-screen p-5 md:ml-64 md:p-9">{children}</main></body></html>;
}
