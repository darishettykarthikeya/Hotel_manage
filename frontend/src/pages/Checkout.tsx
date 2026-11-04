import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { buildOrderPayload, createOrder } from '../api/orderApi';

export default function Checkout() {
  const { cart, subtotal } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cart.length === 0) {
    navigate('/menu');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length === 0) return setError('Please enter your name');
    if (!/^\+?[0-9]{10,15}$/.test(mobile.trim())) return setError('Please enter a valid mobile number');
    if (address.trim().length === 0) return setError('Please enter your delivery address');

    setSubmitting(true);
    try {
      const payload = buildOrderPayload(cart, {
        name: name.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        landmark: landmark.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      const order = await createOrder(payload);
      navigate(`/payment/${order.orderNumber}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not place the order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-stone-900">Checkout</h1>
      <p className="mt-1 text-sm text-stone-500">
        We only ask for what's needed to deliver your order.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            required
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Mobile Number *</label>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="+91 9876543210"
            maxLength={20}
            required
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Delivery Address *</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={500}
            required
            rows={3}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Landmark (optional)</label>
          <input
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            maxLength={200}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Order Notes (optional)</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Less spicy"
            maxLength={500}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-stone-50 px-4 py-3">
          <span className="text-sm font-medium text-stone-600">Subtotal</span>
          <span className="font-bold text-stone-900">₹{subtotal.toFixed(0)}</span>
        </div>
        <p className="text-xs text-stone-400">
          Final total (with any delivery charge) is confirmed on the payment screen.
        </p>

        {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--color-brand)' }}
        >
          {submitting ? 'Placing order...' : 'Review & Pay'}
        </button>
      </form>
    </div>
  );
}
