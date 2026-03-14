import { use } from "react";
import TrackingClient from "./tracking-client";

export default function OrderTrackingPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params);
  return <TrackingClient orderNumber={orderNumber} />;
}
