// ifty
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ServiceSearch from './pages/services/ServiceSearch';
import ServiceDetails from './pages/services/ServiceDetails';
import AddService from './pages/services/AddService';   //Rafi
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import AdminPanel from './pages/admin/AdminPanel';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminPanel />} />
          
          {/* Service Routes */}
          <Route path="/services" element={<ServiceSearch />} />
          <Route path="/services/add" element={<AddService />} />  {/*Rafi*/}  
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/services/:id/reviews" element={<div style={{ padding: '40px', textAlign: 'center' }}><h2>Reviews Page</h2><p>Coming soon...</p></div>} />
          
          {/* Placeholder for other routes */}
          <Route path="*" element={<div style={{ padding: '40px', textAlign: 'center' }}><h2>404 - Page Not Found</h2></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
