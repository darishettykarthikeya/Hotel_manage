import { useEffect, useState } from 'react';
import { createCategory, getAdminCategories, updateCategory } from '../../api/adminApi';
import type { Category } from '../../api/types';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', active: true, displayOrder: 0 });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    getAdminCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startCreate() {
    setEditing(null);
    setForm({ name: '', description: '', active: true, displayOrder: categories.length + 1 });
    setShowForm(true);
    setError(null);
  }

  function startEdit(c: Category) {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '', active: c.active, displayOrder: c.displayOrder });
    setShowForm(true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await updateCategory(editing.id, form);
      } else {
        await createCategory(form);
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not save category');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Categories</h1>
        <button
          onClick={startCreate}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
        >
          + Add Category
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-stone-500">Loading...</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-stone-500">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2">{c.displayOrder}</td>
                  <td className="px-4 py-2 font-medium text-stone-900">{c.name}</td>
                  <td className="px-4 py-2 text-stone-500">{c.description}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.active ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-500'}`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => startEdit(c)} className="text-sm font-medium text-stone-600 underline">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h2 className="font-bold text-stone-900">{editing ? 'Edit Category' : 'New Category'}</h2>

            <label className="mt-4 block text-sm font-medium text-stone-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />

            <label className="mt-3 block text-sm font-medium text-stone-700">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />

            <label className="mt-3 block text-sm font-medium text-stone-700">Display Order</label>
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />

            <label className="mt-3 flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active (visible to customers)
            </label>

            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-stone-300 py-2 text-sm font-semibold text-stone-700"
              >
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
