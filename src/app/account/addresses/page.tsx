"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { ArrowLeft, MapPinPlus } from "lucide-react";

type Address = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: number;
};

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const token = window.localStorage.getItem("admire-user-token");
    if (!token) {
      router.push('/login');
      return;
    }

    fetch("/api/me/addresses", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { setAddresses(data.addresses || []); })
      .catch(() => setAddresses([]));
  }, []);

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 md:px-8 lg:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href="/account" className="inline-flex items-center gap-2 text-sm font-medium text-[#5d2a25]">
          <ArrowLeft className="h-4 w-4" />
          Back to account
        </Link>
        <button type="button" className="inline-flex items-center gap-2 rounded-full bg-[#4b1f1d] px-4 py-2.5 text-sm font-medium text-white">
          <MapPinPlus className="h-4 w-4" />
          Add address
        </button>
      </div>

      <div className="rounded-[30px] border border-[#eadcce] bg-white p-5 shadow-[0_18px_36px_rgba(84,58,45,0.04)] md:p-6">
        <h1 className="mb-5 font-serif text-5xl text-[#201614]">Saved addresses</h1>
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[#d9c3b8] bg-[#fffaf7] p-5 text-sm text-[#5a4b45]">No saved addresses yet.</div>
          ) : (
            addresses.map((address) => (
              <div key={address.id} className="rounded-[22px] border border-[#efe3d9] bg-[#fffaf7] p-4 text-sm text-[#4d3d39]">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="font-medium uppercase tracking-[0.18em] text-[#7a655d]">{address.label}</div>
                  {address.is_default ? <span className="rounded-full bg-[#edf5ee] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1d6a3d]">Default</span> : null}
                </div>
                <div>{address.full_name}</div>
                <div>{address.line1}</div>
                {address.line2 ? <div>{address.line2}</div> : null}
                <div>{address.city}, {address.state} - {address.pincode}</div>
                <div>{address.country}</div>
                <div className="mt-3 text-[#5d2a25]">{address.phone}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
