import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchBox from './SearchBox';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      {/* <Link to={isAdmin ? '/admin/orders' : '/'} className="navbar__logo">
        QuickCart
      </Link> */}

      {!isAdmin && <SearchBox />}

      {/* <nav className="navbar__links"></nav> */}
      <Link to={isAdmin ? '/admin/orders' : '/'} className="navbar__logo">
        QuickCart
      </Link>

      <nav className="navbar__links">
        {!isAuthenticated && (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}

        {isAuthenticated && !isAdmin && (
          <>
            {/* <NavLink to="/cart">Cart</NavLink> */}
            <NavLink to="/cart">
              Cart
              {itemCount > 0 && (
                <span className="badge" aria-label={`${itemCount} items in cart`}>
                  {itemCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/orders">Orders</NavLink>
            <NavLink to="/account">Account</NavLink>
            <button type="button" onClick={handleLogout}>Logout</button>
          </>
        )}

        {isAdmin && (
          <>
            <NavLink to="/admin/products">Products</NavLink>
            <NavLink to="/admin/categories">Categories</NavLink>
            <NavLink to="/admin/inventory">Inventory</NavLink>
            <NavLink to="/admin/orders">Orders</NavLink>
            <button type="button" onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}