import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminOrders } from '../../api/adminApi';
import type { AdminOrderSummary } from '../../api/types';
import { StatusBadge } from './Dashboard';

const STATUS_FILTERS = ['ALL', 'PENDING_PAYMENT', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export default function Orders() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAdminOrders(filter === 'ALL' ? undefined : filter)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Orders</h1>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === s ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-stone-500">Loading...</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-stone-500">
              <tr>
                <th className="px-4 py-2">Order #</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Payment</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-stone-50">
                  <td className="px-4 py-2">
                    <Link to={`/admin/orders/${o.id}`} className="font-semibold text-stone-900 underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-stone-600">
                    {o.customerName}
                    <div className="text-xs text-stone-400">{o.customerMobile}</div>
                  </td>
                  <td className="px-4 py-2 font-medium text-stone-900">₹{o.totalAmount.toFixed(0)}</td>
                  <td className="px-4 py-2 text-stone-500">{o.paymentStatus}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={o.orderStatus} />
                  </td>
                  <td className="px-4 py-2 text-stone-400">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-stone-400">
                    No orders in this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
