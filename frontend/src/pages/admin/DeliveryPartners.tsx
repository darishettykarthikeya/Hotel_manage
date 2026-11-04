import { useEffect, useState } from 'react';
import { createDeliveryPartner, getDeliveryPartners, updateDeliveryPartner } from '../../api/adminApi';
import type { DeliveryPartner } from '../../api/types';

export default function DeliveryPartners() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DeliveryPartner | null>(null);
  const [form, setForm] = useState({ name: '', mobile: '', active: true });
  const [error, setError] = useState<string | null>(null);

  function load() {
    getDeliveryPartners()
      .then(setPartners)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startCreate() {
    setEditing(null);
    setForm({ name: '', mobile: '', active: true });
    setShowForm(true);
    setError(null);
  }

  function startEdit(p: DeliveryPartner) {
    setEditing(p);
    setForm({ name: p.name, mobile: p.mobile, active: p.active });
    setShowForm(true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await updateDeliveryPartner(editing.id, form);
      } else {
        await createDeliveryPartner(form);
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not save delivery partner');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Delivery Partners</h1>
        <button onClick={startCreate} className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
          + Add Partner
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-stone-500">Loading...</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-stone-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Mobile</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {partners.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 font-medium text-stone-900">{p.name}</td>
                  <td className="px-4 py-2 text-stone-600">{p.mobile}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.active ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-500'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => startEdit(p)} className="text-sm font-medium text-stone-600 underline">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {partners.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-stone-400">
                    No delivery partners yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h2 className="font-bold text-stone-900">{editing ? 'Edit Partner' : 'New Delivery Partner'}</h2>

            <label className="mt-4 block text-sm font-medium text-stone-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />

            <label className="mt-3 block text-sm font-medium text-stone-700">Mobile</label>
            <input
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              placeholder="+91 9876543210"
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />

            <label className="mt-3 flex items-center gap-2 text-sm text-stone-700">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Active
            </label>

            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-stone-300 py-2 text-sm font-semibold text-stone-700">
                Cancel
              </button>
              <button type="submit" className="flex-1 rounded-lg bg-stone-900 py-2 text-sm font-semibold text-white">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
