"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LotusOrnament } from "@/components/lotus-ornament";
import { ArrowLeft, Truck, CheckCircle, Clock } from "lucide-react";
import { useParams } from "next/navigation";
import { OrderStatusBadge, RetryPaymentButton, isAwaitingPayment } from "@/components/order-payment-status";
import { CodAdvanceNotice } from "@/components/cod-advance-notice";
import type { CodPaymentDetails } from "@/lib/cod";

type OrderDetail = {
  id: string;
  orderNumber?: string;
  date: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "awaiting_payment" | "awaiting_cod_advance";
  paymentStatus?: string;
  paymentMethod?: string;
  codAdvanceAmount?: number;
  codPayment?: CodPaymentDetails;
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
        <p className="text-[var(--ink)]/70">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
        <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm font-medium text-[#7D1D1D]">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
        <div className="mt-8 rounded-xl border border-[var(--ink)]/10 bg-[var(--background)] p-8 text-center">
          <p className="text-lg font-medium text-[var(--ink)]">Order not found.</p>
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
      <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm font-medium text-[#7D1D1D] mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="rounded-xl border border-[var(--ink)]/10 bg-white p-6 shadow-[var(--shadow-sm)]">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ink)]">Order {order.orderNumber || order.id}</h1>
            <p className="mt-1 text-sm text-[var(--ink)]/70">{new Date(order.date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <OrderStatusBadge status={order.status} paymentStatus={order.paymentStatus} />
            </div>
            {order.paymentMethod ? (
              <span className="text-xs text-[var(--ink)]/70">
                {order.paymentMethod} · {order.paymentStatus}
              </span>
            ) : null}
          </div>
        </div>

        {isAwaitingPayment(order.status) ? (
          <div className="mb-8 rounded-lg border border-[#f0d9b5] bg-[#fff8ee] p-5">
            <p className="mb-3 text-sm text-[var(--ink)]/70">
              Payment for this order wasn&apos;t completed. Pay now to confirm it — unpaid orders are cancelled automatically and the items released.
            </p>
            <RetryPaymentButton orderId={order.id} expiresAt={order.paymentExpiresAt} onChange={loadOrder} />
          </div>
        ) : null}
        {order.status === "awaiting_cod_advance" ? (
          <div className="mb-8">
            <CodAdvanceNotice orderNumber={order.orderNumber || order.id} total={order.total} advance={Number(order.codAdvanceAmount || 500)} payment={order.codPayment} />
          </div>
        ) : null}
        {order.paymentStatus === "Refund Due" ? (
          <div className="mb-8 rounded-lg border border-[#f0d9b5] bg-[#fff8ee] p-5 text-sm text-[var(--ink)]/70">
            Your payment was received after this order was cancelled. The full amount will be refunded to your original payment method within 5–7 working days.
          </div>
        ) : null}

        {/* Order Items */}
        <div className="mb-8 border-t border-[var(--ink)]/10 pt-6">
          <h2 className="mb-4 font-semibold text-[var(--ink)]">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--background)]">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--ink)]">{item.name}</h3>
                  {item.color && <p className="text-sm text-[var(--ink)]/70">Color: {item.color}</p>}
                  {item.size && <p className="text-sm text-[var(--ink)]/70">Size: {item.size}</p>}
                  <p className="mt-2 text-sm font-medium text-[var(--ink)]">Qty: {item.quantity} × ₹{item.price}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[var(--ink)]">₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-8 border-t border-[var(--ink)]/10 pt-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--ink)]/70">Subtotal</span>
              <span className="font-medium text-[var(--ink)]">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ink)]/70">Shipping</span>
              <span className="font-medium text-[var(--ink)]">{order.shipping === 0 ? "Free" : `₹${order.shipping}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-[var(--ink)]/70">Discount</span>
                <span className="font-medium text-green-600">-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--ink)]/10 pt-3 font-semibold text-[var(--ink)]">
              <span>Total</span>
              <span className="text-lg">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="rounded-lg bg-[var(--background)] p-5">
            <h3 className="mb-3 font-semibold text-[var(--ink)]">Shipping Address</h3>
            <div className="text-sm text-[var(--ink)]/70">
              <p className="font-medium text-[var(--ink)]">{order.shippingAddress.name}</p>
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
