import { OrderHistory } from "@/components/order-history";

export const metadata = {
  title: "Order History | Admire Boutique",
  description: "View your past orders and track your purchases",
};

export default function OrdersPage() {
  return <OrderHistory />;
}
