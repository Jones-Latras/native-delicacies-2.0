import { ConfirmationClient } from "./confirmation-client";

export const metadata = {
  title: "Order Confirmed | Native Delicacies",
  description: "Your order has been placed successfully",
};

export default function OrderConfirmationPage() {
  return <ConfirmationClient />;
}
