import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, addToCart, decrement, removeFromCart, subtotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl">🛒</div>
        <h2 className="mt-4 text-lg font-semibold text-stone-900">Your cart is empty</h2>
        <Link
          to="/menu"
          className="mt-4 inline-block rounded-full px-6 py-2.5 text-sm font-bold text-white"
          style={{ backgroundColor: 'var(--color-brand)' }}
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-stone-900">Your Cart</h1>

      <div className="mt-4 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
        {cart.map((line) => (
          <div key={line.foodItemId} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-stone-900">{line.name}</p>
              <p className="text-sm text-stone-500">₹{line.price.toFixed(0)} each</p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-3 rounded-lg px-2 py-1 text-white"
                style={{ backgroundColor: 'var(--color-brand)' }}
              >
                <button onClick={() => decrement(line.foodItemId)} className="w-5 font-bold">
                  −
                </button>
                <span className="font-semibold">{line.quantity}</span>
                <button
                  onClick={() => addToCart({ id: line.foodItemId, name: line.name, price: line.price } as any)}
                  className="w-5 font-bold"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeFromCart(line.foodItemId)}
                className="text-xs font-medium text-stone-400 hover:text-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
        <span className="font-semibold text-stone-700">Subtotal</span>
        <span className="text-lg font-bold text-stone-900">₹{subtotal.toFixed(0)}</span>
      </div>
      <p className="mt-1 text-xs text-stone-400">
        Delivery charge and taxes (if any) are calculated at checkout.
      </p>

      <button
        onClick={() => navigate('/checkout')}
        className="mt-6 w-full rounded-xl py-3 text-sm font-bold text-white"
        style={{ backgroundColor: 'var(--color-brand)' }}
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
