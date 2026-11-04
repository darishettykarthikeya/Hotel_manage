const STEPS = ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Awaiting Payment',
  PAYMENT_FAILED: 'Payment Failed',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function OrderStatus({ status }: { status: string }) {
  if (status === 'CANCELLED' || status === 'PAYMENT_FAILED' || status === 'PENDING_PAYMENT') {
    return (
      <div className="rounded-lg bg-stone-100 px-4 py-3 text-center font-semibold text-stone-700">
        {LABELS[status] ?? status}
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, i) => (
        <div key={step} className="flex flex-1 flex-col items-center text-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
              i <= currentIndex ? '' : 'bg-stone-300'
            }`}
            style={i <= currentIndex ? { backgroundColor: 'var(--color-brand)' } : undefined}
          >
            {i + 1}
          </div>
          <span className="mt-1 text-[11px] font-medium text-stone-600">{LABELS[step]}</span>
          {i < STEPS.length - 1 && (
            <div
              className={`absolute mt-4 h-0.5 w-full ${i < currentIndex ? '' : 'bg-stone-300'}`}
              style={i < currentIndex ? { backgroundColor: 'var(--color-brand)' } : undefined}
            />
          )}
        </div>
      ))}
    </div>
  );
}
