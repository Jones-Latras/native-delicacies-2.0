import { ConfirmationClient } from "./confirmation-client";

export const metadata = {
  title: "Order Confirmed | J&J Native Delicacies",
  description: "Your order has been placed successfully",
};

export default function OrderConfirmationPage() {
  return <ConfirmationClient />;
}

