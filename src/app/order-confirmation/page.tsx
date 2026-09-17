import { Suspense } from "react";
import { OrderConfirmation } from "@/components/order-confirmation";

export default function OrderConfirmationRoute() {
  return (
    <Suspense fallback={null}>
      <OrderConfirmation />
    </Suspense>
  );
}
