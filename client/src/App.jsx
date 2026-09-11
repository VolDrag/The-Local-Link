import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ServiceSearch from './pages/services/ServiceSearch';
import ServiceDetails from './pages/services/ServiceDetails';
import AddService from './pages/services/AddService';
import EditService from './pages/services/EditService';
import CategoriesPage from './pages/services/CategoriesPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReports from './pages/admin/AdminReports';
import AdminVerification from './pages/admin/AdminVerification';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminAudit from './pages/admin/AdminAudit';
import UserProfile from './pages/dashboard/UserProfile';
import EditProfile from './pages/dashboard/EditProfile';
import PublicProfile from './pages/profile/PublicProfile';
import ServiceReviews from './pages/services/ServiceReviews';
import NotificationsPage from './pages/notifications/NotificationsPage';
import BookingHistory from './pages/dashboard/BookingHistory';
import BookingDetails from './pages/dashboard/BookingDetails';
import ProviderBookingHistory from './pages/dashboard/ProviderBookingHistory';
import FavoritesPage from './pages/favorites/FavoritesPage';
import Home from './pages/home/Home';
import Events from './pages/events/Events';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import SandboxPay from './pages/payments/SandboxPay';
import PaymentResult from './pages/payments/PaymentResult';
import VerificationPage from './pages/verification/VerificationPage';
import PayoutsPage from './pages/payouts/PayoutsPage';
import Layout from './components/layout/Layout';
import './App.css';

const NotFound = () => (
  <Layout>
    <div className="module-page">
      <h2>Page not found</h2>
      <p className="module-lead">That link does not exist. Head back to services to keep browsing.</p>
    </div>
  </Layout>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/providers" element={<AdminVerification />} />
          <Route path="/admin/disputes" element={<AdminDisputes />} />
          <Route path="/admin/payouts" element={<AdminPayouts />} />
          <Route path="/admin/audit" element={<AdminAudit />} />

          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/payouts" element={<PayoutsPage />} />

          <Route path="/bookings/history" element={<BookingHistory />} />
          <Route path="/bookings/provider-history" element={<ProviderBookingHistory />} />
          <Route path="/bookings/:id" element={<BookingDetails />} />

          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/payments/sandbox/:paymentID" element={<SandboxPay />} />
          <Route path="/payments/result" element={<PaymentResult />} />

          <Route path="/services" element={<ServiceSearch />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/services/add" element={<AddService />} />
          <Route path="/services/:id/edit" element={<EditService />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/services/:id/reviews" element={<ServiceReviews />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
