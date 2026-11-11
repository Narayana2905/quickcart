import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Placeholder from './pages/Placeholder';
import GuestRoute from './components/GuestRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/customer/Home';
import Cart from './pages/customer/Cart';
import ProductList from './pages/customer/ProductList';
import ProductDetail from './pages/customer/ProductDetail';
import Account from './pages/customer/Account';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import OrderDetail from './pages/customer/OrderDetail';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminInventory from './pages/admin/AdminInventory';
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<Account />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        {/* <Route path="/" element={<Placeholder name="Home" />} /> */}
        {/* <Route path="/products" element={<Placeholder name="Product list" />} /> */}
        {/* <Route path="/products/:id" element={<Placeholder name="Product detail" />} /> */}
        {/* <Route path="/login" element={<Placeholder name="Login" />} /> */}
        {/* <Route path="/register" element={<Placeholder name="Register" />} /> */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Customer only */}
        <Route element={<ProtectedRoute role="CUSTOMER" />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          {/* <Route path="/cart" element={<Placeholder name="Cart" />} /> */}
          {/* <Route path="/checkout" element={<Placeholder name="Checkout" />} /> */}
          {/* <Route path="/orders" element={<Placeholder name="My orders" />} /> */}
          {/* <Route path="/orders/:id" element={<Placeholder name="Order detail" />} /> */}
          <Route path="/account" element={<Placeholder name="Account" />} />
        </Route>

        {/* Admin only */}
        <Route path="/admin" element={<Navigate to="/admin/orders" replace />} />
        <Route element={<ProtectedRoute role="ADMIN" />}>
          {/* <Route path="/admin/orders" element={<Placeholder name="Admin orders" />} /> */}
          {/* <Route path="/admin/orders/:id" element={<Placeholder name="Admin order detail" />} /> */}
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/new" element={<AdminProductForm />} />
          <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          {/* <Route path="/admin/products" element={<Placeholder name="Admin products" />} /> */}
          {/* <Route path="/admin/products/new" element={<Placeholder name="Admin product form (new)" />} /> */}
          {/* <Route path="/admin/products/:id/edit" element={<Placeholder name="Admin product form (edit)" />} /> */}
          {/* <Route path="/admin/categories" element={<Placeholder name="Admin categories" />} /> */}
          {/* <Route path="/admin/inventory" element={<Placeholder name="Admin inventory" />} /> */}
        </Route>

        <Route path="*" element={<h2>Page not found</h2>} />
      </Route>
    </Routes>
  );
}