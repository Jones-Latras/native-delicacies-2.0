import { use } from "react";
import OrderDetailClient from "./order-detail-client";

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <OrderDetailClient orderId={id} />;
}
