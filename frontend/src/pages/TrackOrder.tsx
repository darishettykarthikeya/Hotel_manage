import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { trackOrder } from '../api/orderApi';
import type { OrderResponse } from '../api/types';
import OrderStatus from '../components/OrderStatus';

export default function TrackOrder() {
  const { token: tokenFromUrl } = useParams<{ token?: string }>();
  const [input, setInput] = useState('');
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup(rawToken: string) {
    // Accept either a bare token or a full tracking link pasted in.
    const token = rawToken.trim().split('/').pop() || rawToken.trim();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const result = await trackOrder(token);
      setOrder(result);
    } catch {
      setError('Order not found. Please check your tracking link or order number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tokenFromUrl) {
      lookup(tokenFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromUrl]);

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900">Track Your Order</h1>
      <p className="mt-1 text-sm text-stone-500">
        Paste the tracking link you received after checkout.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(input);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your tracking link here"
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ backgroundColor: 'var(--color-brand)' }}
        >
          Track
        </button>
      </form>

      {loading && <p className="mt-6 text-sm text-stone-500">Looking up your order...</p>}
      {error && <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {order && !loading && (
        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-stone-900">{order.orderNumber}</h2>
            <span className="text-sm font-medium text-stone-500">₹{order.totalAmount.toFixed(0)}</span>
          </div>

          <div className="relative mt-6 mb-2">
            <OrderStatus status={order.orderStatus} />
          </div>

          {order.deliveryPartner && (
            <a
              href={`tel:${order.deliveryPartner.mobile}`}
              className="mt-6 block w-full rounded-xl py-2.5 text-center text-sm font-bold text-white"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              📞 Call {order.deliveryPartner.name} ({order.deliveryPartner.mobile})
            </a>
          )}

          <div className="mt-4 border-t border-stone-100 pt-3 text-sm text-stone-500">
            <p>{order.deliveryAddress}</p>
            {order.landmark && <p>Near {order.landmark}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
