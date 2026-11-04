import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { trackOrder } from '../api/orderApi';
import type { OrderResponse } from '../api/types';

export default function OrderConfirmation() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    trackOrder(token)
      .then(setOrder)
      .catch(() => setError('We could not find this order. The link may have expired.'));
  }, [token]);

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <Link to="/track" className="mt-4 inline-block text-sm underline text-stone-600">
          Try tracking manually
        </Link>
      </div>
    );
  }

  if (!order) {
    return <p className="mt-16 text-center text-sm text-stone-500">Loading your order...</p>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="rounded-2xl border-2 border-dashed border-green-500 bg-green-50 p-6 text-center">
        <div className="text-4xl">✅</div>
        <h1 className="mt-2 text-xl font-bold text-green-800">ORDER CONFIRMED</h1>

        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-stone-500">Order Number</p>
        <p className="text-3xl font-extrabold tracking-wide text-stone-900">{order.orderNumber}</p>

        <p className="mt-3 text-sm font-medium text-green-700">
          Payment: {order.paymentStatus === 'PAID' ? 'PAID' : order.paymentStatus} · ₹{order.totalAmount.toFixed(0)}
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-stone-700">Delivery Address</h2>
        <p className="mt-1 text-sm text-stone-600">{order.deliveryAddress}</p>
        {order.landmark && <p className="text-sm text-stone-500">Near {order.landmark}</p>}
      </div>

      {order.deliveryPartner ? (
        <div className="mt-4 rounded-xl border border-stone-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-stone-700">Delivery Partner</h2>
          <p className="mt-1 text-lg font-bold text-stone-900">{order.deliveryPartner.name}</p>
          <p className="text-sm text-stone-500">{order.deliveryPartner.mobile}</p>
          <a
            href={`tel:${order.deliveryPartner.mobile}`}
            className="mt-3 block w-full rounded-xl py-2.5 text-center text-sm font-bold text-white"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            📞 CALL DELIVERY PARTNER
          </a>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-500">
          A delivery partner will be assigned shortly. Check back on this page for their contact number.
        </div>
      )}

      <div className="mt-4 rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-stone-700">Order Details</h2>
        <div className="mt-2 divide-y divide-stone-100">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between py-1.5 text-sm">
              <span className="text-stone-600">
                {item.foodName} × {item.quantity}
              </span>
              <span className="font-medium text-stone-900">₹{item.lineTotal.toFixed(0)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 border-t border-stone-200 pt-2 text-sm text-stone-500">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{order.deliveryCharge === 0 ? 'Free' : `₹${order.deliveryCharge.toFixed(0)}`}</span>
          </div>
          <div className="mt-1 flex justify-between text-base font-bold text-stone-900">
            <span>Total</span>
            <span>₹{order.totalAmount.toFixed(0)}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
        📸 Please take a screenshot of your order number for reference.
      </p>

      <Link
        to={`/track/${token}`}
        className="mt-4 block text-center text-sm font-medium text-stone-500 underline"
      >
        Track this order later
      </Link>
    </div>
  );
}
