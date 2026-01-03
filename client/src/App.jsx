// ifty
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ServiceSearch from './pages/services/ServiceSearch';
import ServiceDetails from './pages/services/ServiceDetails';
import AddService from './pages/services/AddService';   //Rafi
import EditService from './pages/services/EditService';   //Rafi
import CategoriesPage from './pages/services/CategoriesPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReports from './pages/admin/AdminReports';
import UserProfile from './pages/dashboard/UserProfile';
import EditProfile from './pages/dashboard/EditProfile';
import PublicProfile from './pages/profile/PublicProfile';
import ServiceReviews from './pages/services/ServiceReviews';//Anupam
import NotificationsPage from './pages/notifications/NotificationsPage'; // Anupam
import BookingHistory from './pages/dashboard/BookingHistory'; // Feature 19 - Anupam
import BookingDetails from './pages/dashboard/BookingDetails'; // Feature 19 - Anupam
import ProviderBookingHistory from './pages/dashboard/ProviderBookingHistory'; // Feature 19 - Anupam
import Home from './pages/home/Home';
import Events from './pages/events/Events';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Home Route */}
          <Route path="/" element={<Home />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Email Verification and Password Reset */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          
          {/* Profile Routes */}
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          
          {/* Notification Routes - Anupam */}
          <Route path="/notifications" element={<NotificationsPage />} />
          
          {/* Events Routes */}
          <Route path="/events" element={<Events />} />
          
          {/* Booking History Routes - Feature 19 (Anupam) */}
          <Route path="/bookings/history" element={<BookingHistory />} />
          <Route path="/bookings/provider-history" element={<ProviderBookingHistory />} />
          <Route path="/bookings/:id" element={<BookingDetails />} />

          {/* Service Routes */}
          <Route path="/services" element={<ServiceSearch />} />
          <Route path="/categories" element={<CategoriesPage />} /> {/* #ifty - Categories page route */}
          <Route path="/services/add" element={<AddService />} />  {/*Rafi*/}
          <Route path="/services/:id/edit" element={<EditService />} />  {/*Rafi*/}
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/services/:id/reviews" element={<ServiceReviews />} />
          
          {/* Placeholder for other routes */}
          <Route path="*" element={<div style={{ padding: '40px', textAlign: 'center' }}><h2>404 - Page Not Found</h2></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
