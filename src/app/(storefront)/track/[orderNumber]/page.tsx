export default function OrderTrackingPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-stone-900">Track Your Order</h1>
      <p className="mt-2 text-stone-500">Order tracking — will be built in Phase 7.</p>
    </div>
  );
}
