import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  assignDeliveryPartner,
  getAdminOrderDetail,
  getDeliveryPartners,
  updateOrderStatus,
} from '../../api/adminApi';
import type { AdminOrderDetail, DeliveryPartner } from '../../api/types';
import { StatusBadge } from './Dashboard';

const NEXT_STATUS: Record<string, string[]> = {
  PENDING_PAYMENT: ['CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  PAYMENT_FAILED: [],
};

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!id) return;
    Promise.all([getAdminOrderDetail(Number(id)), getDeliveryPartners()])
      .then(([o, p]) => {
        setOrder(o);
        setPartners(p.filter((partner) => partner.active));
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function changeStatus(status: string) {
    if (!order) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateOrderStatus(order.id, status);
      setOrder(updated);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not update status');
    } finally {
      setSaving(false);
    }
  }

  async function assignPartner(partnerId: number) {
    if (!order) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await assignDeliveryPartner(order.id, partnerId);
      setOrder(updated);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not assign delivery partner');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-stone-500">Loading...</p>;
  if (!order) return <p className="text-sm text-stone-500">Order not found.</p>;

  return (
    <div className="max-w-2xl">
      <Link to="/admin/orders" className="text-sm text-stone-500 underline">
        ← Back to Orders
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">{order.orderNumber}</h1>
        <StatusBadge status={order.orderStatus} />
      </div>
      <p className="text-sm text-stone-500">Placed {new Date(order.createdAt).toLocaleString()}</p>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-stone-700">Customer</h2>
          <p className="mt-1 text-stone-900">{order.customerName}</p>
          <p className="text-stone-500">{order.customerMobile}</p>
          <p className="mt-2 text-stone-600">{order.deliveryAddress}</p>
          {order.landmark && <p className="text-stone-500">Near {order.landmark}</p>}
          {order.notes && <p className="mt-2 text-sm italic text-stone-500">Note: {order.notes}</p>}
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-stone-700">Payment</h2>
          <p className="mt-1 text-stone-900">{order.paymentStatus}</p>
          <div className="mt-2 text-sm text-stone-500">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal.toFixed(0)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>₹{order.deliveryCharge.toFixed(0)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>₹{order.taxAmount.toFixed(0)}</span></div>
            <div className="mt-1 flex justify-between font-bold text-stone-900"><span>Total</span><span>₹{order.totalAmount.toFixed(0)}</span></div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-stone-700">Items</h2>
        <div className="mt-2 divide-y divide-stone-100">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between py-1.5 text-sm">
              <span className="text-stone-600">{item.foodName} × {item.quantity}</span>
              <span className="font-medium text-stone-900">₹{item.lineTotal.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-stone-700">Delivery Partner</h2>
        {order.deliveryPartnerName ? (
          <p className="mt-1 text-stone-900">{order.deliveryPartnerName} · {order.deliveryPartnerMobile}</p>
        ) : (
          <p className="mt-1 text-sm text-stone-400">Not assigned yet</p>
        )}
        <select
          disabled={saving}
          value={order.deliveryPartnerId ?? ''}
          onChange={(e) => e.target.value && assignPartner(Number(e.target.value))}
          className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        >
          <option value="">Assign a delivery partner...</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.mobile})
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-stone-700">Update Status</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {(NEXT_STATUS[order.orderStatus] || []).map((status) => (
            <button
              key={status}
              disabled={saving}
              onClick={() => changeStatus(status)}
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Mark as {status.replace(/_/g, ' ')}
            </button>
          ))}
          {(NEXT_STATUS[order.orderStatus] || []).length === 0 && (
            <p className="text-sm text-stone-400">No further status changes available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
