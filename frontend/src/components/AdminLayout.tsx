import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/foods', label: 'Foods' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/delivery-partners', label: 'Delivery Partners' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const adminName = localStorage.getItem('admin_name') || 'Admin';

  function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="flex">
        <aside className="hidden w-56 flex-shrink-0 flex-col bg-stone-900 text-white sm:flex min-h-screen">
          <div className="px-5 py-5 text-lg font-bold">🍽️ HotelEats Admin</div>
          <nav className="flex-1 px-2">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block rounded-lg px-3 py-2 text-sm font-medium mb-1 ${
                  location.pathname === item.to
                    ? 'bg-stone-700 text-white'
                    : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 py-4 text-xs text-stone-400 border-t border-stone-700">
            Signed in as {adminName}
            <button onClick={logout} className="mt-2 block font-semibold text-red-400">
              Log out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
