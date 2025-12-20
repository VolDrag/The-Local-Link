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
import UserProfile from './pages/dashboard/UserProfile';
import EditProfile from './pages/dashboard/EditProfile';
import ServiceReviews from './pages/services/ServiceReviews';//Anupam
import NotificationsPage from './pages/notifications/NotificationsPage'; // Anupam
import Home from './pages/home/Home';
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
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Profile Routes */}
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          
          {/* Notification Routes - Anupam */}
          <Route path="/notifications" element={<NotificationsPage />} />
          
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
