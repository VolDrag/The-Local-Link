import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => (location.pathname === path ? 'is-active' : '');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          The Local Link
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <ul className={`navbar-menu ${menuOpen ? 'is-open' : ''}`}>
          <li><Link className={isActive('/categories')} to="/categories">Services</Link></li>
          {user && <li><Link className={isActive('/events')} to="/events">Events</Link></li>}

          {user?.role === 'provider' && (
            <>
              <li><Link className={isActive('/bookings/provider-history')} to="/bookings/provider-history">Jobs</Link></li>
              <li><Link className={isActive('/payouts')} to="/payouts">Payouts</Link></li>
              <li><Link className={isActive('/verification')} to="/verification">Verify</Link></li>
            </>
          )}

          {user?.role === 'seeker' && (
            <>
              <li><Link className={isActive('/bookings/history')} to="/bookings/history">Bookings</Link></li>
              <li><Link className={isActive('/favorites')} to="/favorites">Saved</Link></li>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <li><Link className={isActive('/admin/dashboard')} to="/admin/dashboard">Dashboard</Link></li>
              <li><Link className={isActive('/admin/providers')} to="/admin/providers">Verify</Link></li>
              <li><Link className={isActive('/admin/disputes')} to="/admin/disputes">Disputes</Link></li>
            </>
          )}

          {user ? (
            <>
              <li className="nav-bell"><NotificationBell /></li>
              <li><Link to="/profile" className="btn-profile">Profile</Link></li>
              <li>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register" className="btn-profile">Join</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
