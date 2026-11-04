import type { FoodItem } from '../api/types';
import { useCart } from '../context/CartContext';

export default function FoodCard({ food }: { food: FoodItem }) {
  const { cart, addToCart, decrement } = useCart();
  const line = cart.find((l) => l.foodItemId === food.id);
  const qty = line?.quantity ?? 0;

  return (
    <div className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
        {food.imageUrl ? (
          <img src={food.imageUrl} alt={food.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">🍲</div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            {food.veg !== null && (
              <span
                className={`inline-block h-3 w-3 rounded-sm border-2 ${
                  food.veg ? 'border-green-600' : 'border-red-600'
                }`}
              >
                <span
                  className={`block h-1 w-1 m-auto rounded-full ${
                    food.veg ? 'bg-green-600' : 'bg-red-600'
                  }`}
                />
              </span>
            )}
            <h3 className="font-semibold text-stone-900">{food.name}</h3>
          </div>
          {food.description && (
            <p className="mt-1 text-sm text-stone-500 line-clamp-2">{food.description}</p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold text-stone-900">₹{food.price.toFixed(0)}</span>

          {qty === 0 ? (
            <button
              onClick={() => addToCart(food)}
              className="rounded-lg border-2 px-4 py-1.5 text-sm font-bold"
              style={{ color: 'var(--color-brand)', borderColor: 'var(--color-brand)' }}
            >
              ADD
            </button>
          ) : (
            <div
              className="flex items-center gap-3 rounded-lg px-2 py-1 text-white"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              <button onClick={() => decrement(food.id)} className="w-5 font-bold">
                −
              </button>
              <span className="font-semibold">{qty}</span>
              <button onClick={() => addToCart(food)} className="w-5 font-bold">
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
