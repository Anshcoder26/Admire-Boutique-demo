"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LotusOrnament } from "@/components/lotus-ornament";
import { ArrowLeft, Truck, CheckCircle, Clock } from "lucide-react";
import { useParams } from "next/navigation";
import { OrderStatusBadge, RetryPaymentButton, isAwaitingPayment } from "@/components/order-payment-status";

type OrderDetail = {
  id: string;
  orderNumber?: string;
  date: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "awaiting_payment";
  paymentStatus?: string;
  paymentMethod?: string;
  paymentExpiresAt?: string | null;
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

  const loadOrder = useCallback(() => {
    if (!orderId) return;

    fetch(`/api/me/orders?id=${orderId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrder(data.order);
        }
      })
      .catch(() => {
        setOrder(null);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

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
        <Link href="/account/orders" className="inline-flex items-center gap-2 rounded-full bg-[#f5e9e4] px-4 py-2 text-sm font-medium text-[#4b1f1d] transition hover:bg-[#eadcd3]">
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
      <Link href="/account/orders" className="inline-flex items-center gap-2 rounded-full bg-[#f5e9e4] px-4 py-2 text-sm font-medium text-[#4b1f1d] transition hover:bg-[#eadcd3] mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="rounded-[30px] border border-[#eadcd3] bg-white p-6 shadow-[0_14px_32px_rgba(84,58,45,0.05)]">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl text-[#201614]">Order {order.orderNumber || order.id}</h1>
            <p className="mt-1 text-sm text-[#584942]">{new Date(order.date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <OrderStatusBadge status={order.status} paymentStatus={order.paymentStatus} />
            </div>
            {order.paymentMethod ? (
              <span className="text-xs text-[#584942]">
                {order.paymentMethod} · {order.paymentStatus}
              </span>
            ) : null}
          </div>
        </div>

        {isAwaitingPayment(order.status) ? (
          <div className="mb-8 rounded-2xl border border-[#f0d9b5] bg-[#fff8ee] p-5">
            <p className="mb-3 text-sm text-[#584942]">
              Payment for this order wasn&apos;t completed. Pay now to confirm it — unpaid orders are cancelled automatically and the items released.
            </p>
            <RetryPaymentButton orderId={order.id} expiresAt={order.paymentExpiresAt} onChange={loadOrder} />
          </div>
        ) : null}
        {order.paymentStatus === "Refund Due" ? (
          <div className="mb-8 rounded-2xl border border-[#f0d9b5] bg-[#fff8ee] p-5 text-sm text-[#584942]">
            Your payment was received after this order was cancelled. The full amount will be refunded to your original payment method within 5–7 working days.
          </div>
        ) : null}

        {/* Order Items */}
        <div className="mb-8 border-t border-[#eadcd3] pt-6">
          <h2 className="mb-4 font-semibold text-[#241915]">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-[#f5e9e4]">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : null}
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
