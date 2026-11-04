import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold tracking-tight text-stone-900">
          🍽️ <span style={{ color: 'var(--color-brand)' }}>Hotel</span>Eats
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/menu" className="text-sm font-medium text-stone-700 hover:text-stone-900">
            Menu
          </Link>
          <Link to="/track" className="text-sm font-medium text-stone-700 hover:text-stone-900">
            Track Order
          </Link>
          <button
            onClick={() => navigate('/cart')}
            className="relative flex items-center gap-1 rounded-full bg-stone-900 text-white px-4 py-2 text-sm font-semibold"
          >
            🛒 Cart
            {totalItems > 0 && (
              <span
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: 'var(--color-brand)' }}
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
