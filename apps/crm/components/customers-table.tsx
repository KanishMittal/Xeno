"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Order { id: string; amount: number; category: string; createdAt: string }
interface Customer { id: string; name: string; email: string; city: string; totalSpend: number; orderCount: number; lastOrderAt: string | null; ageGroup: string; orders: Order[] }

export function CustomersTable() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Customer | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => { void fetch(`/api/customers?search=${encodeURIComponent(search)}&city=${city}&page=${page}`).then((r) => r.json()).then((data: { customers: Customer[]; total: number }) => { setCustomers(data.customers); setTotal(data.total); }); }, 200);
    return () => clearTimeout(timer);
  }, [search, city, page]);
  return <><div className="mb-4 flex gap-3"><input className="w-full max-w-sm" placeholder="Search name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /><select value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }}><option value="">All cities</option>{["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Jaipur"].map((item) => <option key={item}>{item}</option>)}</select></div>
    <Card className="overflow-x-auto p-0"><table className="w-full text-left text-sm"><thead className="border-b bg-zinc-950 text-muted"><tr>{["Name", "City", "Total Spend", "Orders", "Last Purchase", "Age Group"].map((h) => <th className="px-4 py-3 font-medium" key={h}>{h}</th>)}</tr></thead><tbody>{customers.map((customer) => <tr key={customer.id} onClick={() => setSelected(customer)} className="cursor-pointer border-b hover:bg-zinc-900"><td className="px-4 py-3"><p className="font-medium">{customer.name}</p><p className="text-xs text-muted">{customer.email}</p></td><td className="px-4">{customer.city}</td><td className="px-4">{formatCurrency(customer.totalSpend)}</td><td className="px-4">{customer.orderCount}</td><td className="px-4">{formatDate(customer.lastOrderAt)}</td><td className="px-4">{customer.ageGroup}</td></tr>)}</tbody></table></Card>
    <div className="mt-4 flex items-center justify-between text-sm text-muted"><span>{total} customers</span><div className="flex gap-2"><Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><Button disabled={page * 20 >= total} onClick={() => setPage(page + 1)}>Next</Button></div></div>
    {selected && <div className="fixed inset-0 z-20 bg-black/60" onClick={() => setSelected(null)}><aside className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l bg-zinc-950 p-6" onClick={(e) => e.stopPropagation()}><Button className="float-right bg-zinc-800" onClick={() => setSelected(null)}>Close</Button><h2 className="text-xl font-semibold">{selected.name}</h2><p className="mt-1 text-muted">{selected.email}</p><div className="my-6 grid grid-cols-2 gap-3"><Card><p className="text-xs text-muted">Lifetime value</p><p className="mt-2 font-semibold">{formatCurrency(selected.totalSpend)}</p></Card><Card><p className="text-xs text-muted">Orders</p><p className="mt-2 font-semibold">{selected.orderCount}</p></Card></div><h3 className="mb-3 font-medium">Order history</h3><div className="space-y-2">{selected.orders.map((order) => <Card className="flex justify-between p-3" key={order.id}><span className="capitalize">{order.category}<small className="block text-muted">{formatDate(order.createdAt)}</small></span><span>{formatCurrency(order.amount)}</span></Card>)}</div></aside></div>}
  </>;
}
