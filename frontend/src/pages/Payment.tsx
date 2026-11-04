import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPaymentOrder, verifyPayment } from '../api/paymentApi';
import { useCart } from '../context/CartContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Payment() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) return;
    const currentOrderNumber: string = orderNumber;

    async function startPayment() {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Could not load the payment gateway. Check your internet connection.');
        setStatus('error');
        return;
      }

      try {
        const paymentOrder = await createPaymentOrder(currentOrderNumber);
        setStatus('ready');

        const razorpay = new window.Razorpay({
          key: paymentOrder.razorpayKeyId,
          amount: paymentOrder.amountInPaise,
          currency: paymentOrder.currency,
          name: 'Hotel Food Ordering',
          description: `Order ${paymentOrder.orderNumber}`,
          order_id: paymentOrder.razorpayOrderId,
          prefill: {
            name: paymentOrder.customerName,
            contact: paymentOrder.customerMobile,
          },
          // Only UPI and cards are enabled for Version 1 (net banking excluded per spec).
          method: { netbanking: false, card: true, upi: true, wallet: false, emi: false },
          handler: async function (response: any) {
            try {
              const order = await verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              clearCart();
              const token = order.trackingUrl.split('/').pop();
              navigate(`/order-confirmation/${token}`);
            } catch {
              setError('Payment verification failed. If money was deducted, it will be refunded. Please contact the hotel with your order number: ' + orderNumber);
              setStatus('error');
            }
          },
          modal: {
            ondismiss: function () {
              setError('Payment was cancelled. You can try again.');
              setStatus('error');
            },
          },
          theme: { color: '#d64545' },
        });

        razorpay.open();
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Could not start payment. Please try again.');
        setStatus('error');
      }
    }

    startPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  async function retry() {
    setStatus('loading');
    setError(null);
    // Re-trigger effect by reloading the page — simplest reliable retry for a payment modal.
    window.location.reload();
  }

  function goToTracking() {
    navigate('/track');
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      {status === 'loading' && (
        <>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-stone-800" />
          <p className="mt-4 text-sm text-stone-500">Preparing secure payment...</p>
        </>
      )}

      {status === 'ready' && (
        <p className="text-sm text-stone-500">Complete your payment in the Razorpay window.</p>
      )}

      {status === 'error' && (
        <div>
          <div className="text-3xl">⚠️</div>
          <p className="mt-3 text-sm text-red-700">{error}</p>
          <button
            onClick={retry}
            className="mt-6 rounded-full px-6 py-2.5 text-sm font-bold text-white"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            Try Again
          </button>
          <button onClick={goToTracking} className="mt-3 block w-full text-sm text-stone-500 underline">
            Check order status instead
          </button>
        </div>
      )}
    </div>
  );
}
