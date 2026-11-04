import { useEffect, useState } from 'react';
import {
  createFood,
  getAdminCategories,
  getAdminFoods,
  setFoodAvailability,
  updateFood,
  uploadFoodImage,
} from '../../api/adminApi';
import type { Category, FoodItem } from '../../api/types';

const emptyForm = {
  categoryId: 0,
  name: '',
  description: '',
  price: 0,
  available: true,
  veg: true as boolean | null,
  preparationTimeMinutes: 15,
};

export default function Foods() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  function load() {
    Promise.all([getAdminFoods(), getAdminCategories()])
      .then(([f, c]) => {
        setFoods(f);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startCreate() {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? 0 });
    setShowForm(true);
    setError(null);
  }

  function startEdit(f: FoodItem) {
    setEditing(f);
    setForm({
      categoryId: f.categoryId,
      name: f.name,
      description: f.description || '',
      price: f.price,
      available: f.available,
      veg: f.veg,
      preparationTimeMinutes: f.preparationTimeMinutes ?? 15,
    });
    setShowForm(true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await updateFood(editing.id, form);
      } else {
        await createFood(form);
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not save food item');
    }
  }

  async function toggleAvailability(f: FoodItem) {
    await setFoodAvailability(f.id, !f.available);
    load();
  }

  async function handleImageUpload(f: FoodItem, file: File) {
    setUploadingId(f.id);
    try {
      await uploadFoodImage(f.id, file);
      load();
    } catch {
      alert('Image upload failed');
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Food Items</h1>
        <button onClick={startCreate} className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
          + Add Food
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-stone-500">Loading...</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {foods.map((f) => (
            <div key={f.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex gap-3">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
                  {f.imageUrl ? (
                    <img src={f.imageUrl} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl">🍲</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-stone-900">{f.name}</p>
                  <p className="text-xs text-stone-500">{f.categoryName}</p>
                  <p className="mt-1 font-bold text-stone-900">₹{f.price.toFixed(0)}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 font-medium text-stone-600">
                  <input type="checkbox" checked={f.available} onChange={() => toggleAvailability(f)} />
                  Available
                </label>
                <button onClick={() => startEdit(f)} className="font-medium text-stone-600 underline">
                  Edit
                </button>
              </div>

              <label className="mt-2 block text-xs font-medium text-stone-500">
                {uploadingId === f.id ? 'Uploading...' : 'Upload image'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="mt-1 block w-full text-xs"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(f, e.target.files[0])}
                />
              </label>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-stone-900">{editing ? 'Edit Food' : 'New Food'}</h2>

            <label className="mt-4 block text-sm font-medium text-stone-700">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <label className="mt-3 block text-sm font-medium text-stone-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />

            <label className="mt-3 block text-sm font-medium text-stone-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />

            <label className="mt-3 block text-sm font-medium text-stone-700">Price (₹)</label>
            <input
              type="number"
              min={1}
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />

            <label className="mt-3 block text-sm font-medium text-stone-700">Preparation time (min)</label>
            <input
              type="number"
              min={1}
              value={form.preparationTimeMinutes}
              onChange={(e) => setForm({ ...form, preparationTimeMinutes: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />

            <div className="mt-3 flex items-center gap-4 text-sm">
              <label className="flex items-center gap-1.5">
                <input type="radio" checked={form.veg === true} onChange={() => setForm({ ...form, veg: true })} />
                Veg
              </label>
              <label className="flex items-center gap-1.5">
                <input type="radio" checked={form.veg === false} onChange={() => setForm({ ...form, veg: false })} />
                Non-Veg
              </label>
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
                Available
              </label>
            </div>

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
