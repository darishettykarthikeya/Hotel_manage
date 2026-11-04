import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminOrders } from '../../api/adminApi';
import type { AdminOrderSummary } from '../../api/types';

export default function Dashboard() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const pending = orders.filter((o) =>
    ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)
  );
  const todayRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID' && isToday(o.createdAt))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  function isToday(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>

      {loading ? (
        <p className="mt-6 text-sm text-stone-500">Loading...</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Orders Today" value={orders.filter((o) => isToday(o.createdAt)).length} />
            <StatCard label="Pending / In Progress" value={pending.length} />
            <StatCard label="Revenue Today" value={`₹${todayRevenue.toFixed(0)}`} />
          </div>

          <div className="mt-8 rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-stone-800">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm font-medium text-stone-500 underline">
                View all
              </Link>
            </div>
            <div className="mt-3 divide-y divide-stone-100">
              {orders.slice(0, 8).map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-stone-900">{o.orderNumber}</p>
                    <p className="text-stone-500">{o.customerName} · {o.customerMobile}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-stone-900">₹{o.totalAmount.toFixed(0)}</p>
                    <StatusBadge status={o.orderStatus} />
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="py-4 text-sm text-stone-400">No orders yet.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-stone-900">{value}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING_PAYMENT: 'bg-stone-100 text-stone-600',
    PAYMENT_FAILED: 'bg-red-100 text-red-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PREPARING: 'bg-amber-100 text-amber-700',
    OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-stone-200 text-stone-500',
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${colors[status] || 'bg-stone-100 text-stone-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
