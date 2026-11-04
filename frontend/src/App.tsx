import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminLayout from './components/AdminLayout';

import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderConfirmation from './pages/OrderConfirmation';
import TrackOrder from './pages/TrackOrder';

import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminFoods from './pages/admin/Foods';
import AdminCategories from './pages/admin/Categories';
import AdminOrders from './pages/admin/Orders';
import AdminOrderDetails from './pages/admin/OrderDetails';
import AdminDeliveryPartners from './pages/admin/DeliveryPartners';

function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Customer-facing routes */}
          <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
          <Route path="/menu" element={<CustomerLayout><Menu /></CustomerLayout>} />
          <Route path="/cart" element={<CustomerLayout><Cart /></CustomerLayout>} />
          <Route path="/checkout" element={<CustomerLayout><Checkout /></CustomerLayout>} />
          <Route path="/payment/:orderNumber" element={<CustomerLayout><Payment /></CustomerLayout>} />
          <Route path="/order-confirmation/:token" element={<CustomerLayout><OrderConfirmation /></CustomerLayout>} />
          <Route path="/track" element={<CustomerLayout><TrackOrder /></CustomerLayout>} />
          <Route path="/track/:token" element={<CustomerLayout><TrackOrder /></CustomerLayout>} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/foods" element={<AdminFoods />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
              <Route path="/admin/delivery-partners" element={<AdminDeliveryPartners />} />
            </Route>
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
