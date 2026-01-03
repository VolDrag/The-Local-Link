// Navbar component
// Top navigation bar with authentication links
// Navbar component - Navigation bar with authentication
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          The Local Link
        </Link>

        <ul className="navbar-menu">
          {user ? (
            <>
              <li><Link to="/services">Services</Link></li>
              
              {user.role === 'provider' && (
                <li><Link to="/bookings/provider-history">Service History</Link></li>
              )}
              
              {user.role === 'seeker' && (
                <li><Link to="/bookings/history">My Bookings</Link></li>
              )}
              
              <li><Link to="/notifications" className="nav-icon">🔔</Link></li>
              <li><Link to="/profile" className="btn-profile">👤 My Profile</Link></li>
              <li>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;