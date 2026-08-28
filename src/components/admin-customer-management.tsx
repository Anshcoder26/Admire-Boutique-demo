"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Copy, Mail } from "lucide-react";

interface Customer {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  created_at: string;
  totalOrders?: number;
}

interface Subscriber {
  email: string;
  subscribed_at: string;
}

export function CustomerManagement({ token }: { token: string }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState<"customers" | "subscribers">("customers");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/customers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.customers || []);
          setSubscribers(data.subscribers || []);
        }
      } catch (error) {
        console.error("Failed to load customer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportAsCSV = (data: any[], filename: string) => {
    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map((row) => Object.values(row).map((v) => `"${v}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-6 text-center text-[#8a6f5f]">Loading customer data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button
          onClick={() => setTab("customers")}
          className={`px-6 py-2 rounded-full font-medium transition ${
            tab === "customers"
              ? "bg-[#4b1f1d] text-white"
              : "border border-[#ead9cf] text-[#5a403a]"
          }`}
        >
          Customers ({customers.length})
        </button>
        <button
          onClick={() => setTab("subscribers")}
          className={`px-6 py-2 rounded-full font-medium transition ${
            tab === "subscribers"
              ? "bg-[#4b1f1d] text-white"
              : "border border-[#ead9cf] text-[#5a403a]"
          }`}
        >
          Newsletter ({subscribers.length})
        </button>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-2xl border border-[#ead9cf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b67c60]"
        />
        <button
          onClick={() =>
            exportAsCSV(
              tab === "customers"
                ? filteredCustomers.map(({ id, email, name, phone, totalOrders }) => ({
                    id,
                    email,
                    name: name || "-",
                    phone: phone || "-",
                    totalOrders: totalOrders || 0,
                  }))
                : filteredSubscribers,
              `admire_${tab}_${Date.now()}.csv`
            )
          }
          className="shrink-0 rounded-full bg-[#4b1f1d] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Export CSV
        </button>
      </div>

      {tab === "customers" ? (
        <div className="overflow-x-auto rounded-[20px] border border-[#eadcce]">
          <table className="w-full text-sm">
            <thead className="bg-[#f5f0eb] border-b border-[#eadcce]">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-[#5a403a]">Email</th>
                <th className="px-6 py-3 text-left font-semibold text-[#5a403a]">Name</th>
                <th className="px-6 py-3 text-left font-semibold text-[#5a403a]">Phone</th>
                <th className="px-6 py-3 text-left font-semibold text-[#5a403a]">Orders</th>
                <th className="px-6 py-3 text-left font-semibold text-[#5a403a]">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-[#eadcce] hover:bg-[#fffaf7]">
                  <td className="px-6 py-3">{customer.email}</td>
                  <td className="px-6 py-3">{customer.name || "-"}</td>
                  <td className="px-6 py-3">{customer.phone || "-"}</td>
                  <td className="px-6 py-3 font-medium">{customer.totalOrders || 0}</td>
                  <td className="px-6 py-3 text-[#8a6f5f]">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-2 rounded-[20px] border border-[#eadcce] bg-white p-4">
          {filteredSubscribers.length === 0 ? (
            <p className="p-6 text-center text-[#8a6f5f]">No newsletter subscribers yet</p>
          ) : (
            filteredSubscribers.map((sub) => (
              <div
                key={sub.email}
                className="flex items-center justify-between rounded-lg border border-[#eadcce] bg-[#fffaf7] p-3"
              >
                <div>
                  <p className="font-medium text-[#201614]">{sub.email}</p>
                  <p className="text-xs text-[#8a6f5f]">
                    Subscribed: {new Date(sub.subscribed_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sub.email);
                  }}
                  className="rounded p-2 hover:bg-[#eadcce]"
                  title="Copy email"
                >
                  <Copy className="h-4 w-4 text-[#5a403a]" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
