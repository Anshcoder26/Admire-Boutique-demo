"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LotusOrnament } from "@/components/lotus-ornament";
import { ArrowLeft, Truck, CheckCircle, Clock } from "lucide-react";
import { useParams } from "next/navigation";

type OrderDetail = {
  id: string;
  date: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  items: {
    name: string;
    image: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }[];
  subtotal: number;
  shipping: number;
  discount: number;
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    fetch(`/api/me/orders?id=${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setOrder(data.data);
        }
      })
      .catch(() => {
        // Demo order
        setOrder({
          id: orderId,
          date: "2024-12-20",
          total: 5999,
          status: "delivered",
          shippingAddress: {
            name: "Ansh Agar",
            email: "ansh@example.com",
            phone: "+91 99999 99999",
            address: "123 Fashion Street",
            city: "New Delhi",
            state: "Delhi",
            zip: "110001",
          },
          items: [
            {
              name: "Banarasi Silk Saree",
              image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=500&q=60",
              quantity: 1,
              price: 5999,
              color: "Maroon",
              size: "Free Size",
            },
          ],
          subtotal: 5999,
          shipping: 0,
          discount: 0,
        });
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#584942]">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
        <Link href="/orders" className="inline-flex items-center gap-2 rounded-full bg-[#f5e9e4] px-4 py-2 text-sm font-medium text-[#4b1f1d] transition hover:bg-[#eadcd3]">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
        <div className="mt-8 rounded-[30px] border border-[#eadcd3] bg-[#fffaf6] p-8 text-center">
          <p className="text-lg font-medium text-[#201614]">Order not found.</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: OrderDetail["status"]) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case "shipped":
        return <Truck className="h-8 w-8 text-blue-600" />;
      case "processing":
        return <Clock className="h-8 w-8 text-yellow-600" />;
      default:
        return <Clock className="h-8 w-8 text-gray-600" />;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 lg:px-10">
      <Link href="/orders" className="inline-flex items-center gap-2 rounded-full bg-[#f5e9e4] px-4 py-2 text-sm font-medium text-[#4b1f1d] transition hover:bg-[#eadcd3] mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="rounded-[30px] border border-[#eadcd3] bg-white p-6 shadow-[0_14px_32px_rgba(84,58,45,0.05)]">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl text-[#201614]">Order {order.id}</h1>
            <p className="mt-1 text-sm text-[#584942]">{new Date(order.date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <span className="text-lg font-semibold capitalize text-[#241915]">{order.status}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8 border-t border-[#eadcd3] pt-6">
          <h2 className="mb-4 font-semibold text-[#241915]">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[#241915]">{item.name}</h3>
                  {item.color && <p className="text-sm text-[#584942]">Color: {item.color}</p>}
                  {item.size && <p className="text-sm text-[#584942]">Size: {item.size}</p>}
                  <p className="mt-2 text-sm font-medium text-[#241915]">Qty: {item.quantity} × ₹{item.price}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#241915]">₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-8 border-t border-[#eadcd3] pt-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#584942]">Subtotal</span>
              <span className="font-medium text-[#241915]">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#584942]">Shipping</span>
              <span className="font-medium text-[#241915]">{order.shipping === 0 ? "Free" : `₹${order.shipping}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-[#584942]">Discount</span>
                <span className="font-medium text-green-600">-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[#eadcd3] pt-3 font-semibold text-[#241915]">
              <span>Total</span>
              <span className="text-lg">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="rounded-2xl bg-[#fffaf6] p-5">
            <h3 className="mb-3 font-semibold text-[#241915]">Shipping Address</h3>
            <div className="text-sm text-[#584942]">
              <p className="font-medium text-[#241915]">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
              </p>
              <p className="mt-2">{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
