import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4">
      <section className="mt-8 rounded-3xl bg-stone-900 px-8 py-16 text-center text-white sm:py-24">
        <h1 className="text-3xl font-extrabold sm:text-5xl">Delicious food,<br />delivered to your door</h1>
        <p className="mx-auto mt-4 max-w-md text-stone-300">
          Browse our menu, place your order, and pay online — no account needed.
        </p>
        <Link
          to="/menu"
          className="mt-8 inline-block rounded-full px-8 py-3 text-sm font-bold text-white"
          style={{ backgroundColor: 'var(--color-brand)' }}
        >
          View Menu
        </Link>
      </section>

      <section className="mt-12 grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
        <div>
          <div className="text-3xl">📱</div>
          <h3 className="mt-2 font-semibold">No account needed</h3>
          <p className="text-sm text-stone-500">Order as a guest in seconds.</p>
        </div>
        <div>
          <div className="text-3xl">💳</div>
          <h3 className="mt-2 font-semibold">UPI & Card payments</h3>
          <p className="text-sm text-stone-500">Secure checkout powered by Razorpay.</p>
        </div>
        <div>
          <div className="text-3xl">🛵</div>
          <h3 className="mt-2 font-semibold">Live delivery contact</h3>
          <p className="text-sm text-stone-500">Get your delivery partner's number instantly.</p>
        </div>
      </section>
    </div>
  );
}
