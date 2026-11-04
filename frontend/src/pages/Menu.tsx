import { useEffect, useState } from 'react';
import { getCategories, getFoods } from '../api/foodApi';
import type { Category, FoodItem } from '../api/types';
import FoodCard from '../components/FoodCard';

export default function Menu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError('Could not load categories. Is the backend running?'));
  }, []);

  useEffect(() => {
    setLoading(true);
    getFoods(activeCategory ?? undefined, search || undefined)
      .then((data) => {
        setFoods(data);
        setError(null);
      })
      .catch(() => setError('Could not load the menu. Is the backend running on :8080?'))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-stone-900">Our Menu</h1>

      <input
        type="text"
        placeholder="Search for food..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-4 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
        style={{ '--tw-ring-color': 'var(--color-brand)' } as React.CSSProperties}
      />

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold ${
            activeCategory === null ? 'text-white' : 'bg-stone-100 text-stone-700'
          }`}
          style={activeCategory === null ? { backgroundColor: 'var(--color-brand)' } : undefined}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold ${
              activeCategory === c.id ? 'text-white' : 'bg-stone-100 text-stone-700'
            }`}
            style={activeCategory === c.id ? { backgroundColor: 'var(--color-brand)' } : undefined}
          >
            {c.name}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {loading && !error && <p className="mt-6 text-sm text-stone-500">Loading menu...</p>}

      {!loading && !error && foods.length === 0 && (
        <p className="mt-6 text-sm text-stone-500">No food items found.</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {foods.map((food) => (
          <FoodCard key={food.id} food={food} />
        ))}
      </div>
    </div>
  );
}
