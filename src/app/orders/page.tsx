import { redirect } from "next/navigation";

// Order history lives under the account area.
export default function OrdersPage() {
  redirect("/account/orders");
}
