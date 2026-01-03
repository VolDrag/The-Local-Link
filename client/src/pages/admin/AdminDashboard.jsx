import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import { adminEventService } from '../../services/eventService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [allServices, setAllServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showSeekerModal, setShowSeekerModal] = useState(false);
  const [allSeekers, setAllSeekers] = useState([]);
  const [loadingSeekers, setLoadingSeekers] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [allProviders, setAllProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [allBookings, setAllBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '📦' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [allEvents, setAllEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventForm, setEventForm] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    discount: '', 
    startDate: '', 
    endDate: '', 
    targetAudience: 'all',
    color: '#4F46E5'
  });
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const handleShowAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await adminService.getAllUsers();
      // Backend returns { success: true, data: [...users] }
      // adminService already returns response.data, so we access response.data for the users array
      setAllUsers(response.data || []);
      setShowUserModal(true);
    } catch (err) {
      console.error('Error fetching all users:', err);
      alert(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleShowAllServices = async () => {
    try {
      setLoadingServices(true);
      console.log('Fetching all services...');
      const response = await adminService.getAllServices();
      console.log('Services response:', response);
      console.log('Services data:', response.data);
      setAllServices(response.data || []);
      setShowServiceModal(true);
    } catch (err) {
      console.error('Error fetching all services:', err);
      console.error('Error response:', err.response);
      alert(err.response?.data?.message || 'Failed to load services');
    } finally {
      setLoadingServices(false);
    }
  };

  const handleShowAllSeekers = async () => {
    try {
      setLoadingSeekers(true);
      const response = await adminService.getAllUsers();
      // Filter only seekers
      const seekers = (response.data || []).filter(user => user.role === 'seeker');
      setAllSeekers(seekers);
      setShowSeekerModal(true);
    } catch (err) {
      console.error('Error fetching seekers:', err);
      alert(err.response?.data?.message || 'Failed to load seekers');
    } finally {
      setLoadingSeekers(false);
    }
  };

  const handleShowAllProviders = async () => {
    try {
      setLoadingProviders(true);
      const response = await adminService.getAllUsers();
      // Filter only providers
      const providers = (response.data || []).filter(user => user.role === 'provider');
      setAllProviders(providers);
      setShowProviderModal(true);
    } catch (err) {
      console.error('Error fetching providers:', err);
      alert(err.response?.data?.message || 'Failed to load providers');
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleShowAllBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await adminService.getAllBookings();
      setAllBookings(response.data || []);
      setShowBookingModal(true);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      alert(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleShowCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await adminService.getAllCategories();
      setAllCategories(response.data || []);
      setShowCategoryModal(true);
    } catch (err) {
      console.error('Error fetching categories:', err);
      alert(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await adminService.createCategory(categoryForm);
      setCategoryForm({ name: '', description: '', icon: '📦' });
      await handleShowCategories();
      await fetchDashboardStats();
      alert('Category created successfully');
    } catch (err) {
      console.error('Error creating category:', err);
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateCategory(editingCategory._id, categoryForm);
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', icon: '📦' });
      await handleShowCategories();
      await fetchDashboardStats();
      alert('Category updated successfully');
    } catch (err) {
      console.error('Error updating category:', err);
      alert(err.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    try {
      await adminService.deleteCategory(id);
      await handleShowCategories();
      await fetchDashboardStats();
      alert('Category deleted successfully');
    } catch (err) {
      console.error('Error deleting category:', err);
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  // Event Management Functions
  const handleShowEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await adminEventService.getAllEvents();
      setAllEvents(response || []);
      setShowEventModal(true);
    } catch (err) {
      console.error('Error fetching all events:', err);
      alert(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await adminEventService.createEvent(eventForm);
      setEventForm({ 
        title: '', 
        description: '', 
        category: '', 
        discount: '', 
        startDate: '', 
        endDate: '', 
        targetAudience: 'all',
        color: '#4F46E5'
      });
      await handleShowEvents();
      await fetchDashboardStats();
      alert('Event created successfully');
    } catch (err) {
      console.error('Error creating event:', err);
      alert(err.response?.data?.message || 'Failed to create event');
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      await adminEventService.updateEvent(editingEvent._id, eventForm);
      setEditingEvent(null);
      setEventForm({ 
        title: '', 
        description: '', 
        category: '', 
        discount: '', 
        startDate: '', 
        endDate: '', 
        targetAudience: 'all',
        color: '#4F46E5'
      });
      await handleShowEvents();
      await fetchDashboardStats();
      alert('Event updated successfully');
    } catch (err) {
      console.error('Error updating event:', err);
      alert(err.response?.data?.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    try {
      await adminEventService.deleteEvent(id);
      await handleShowEvents();
      await fetchDashboardStats();
      alert('Event deleted successfully');
    } catch (err) {
      console.error('Error deleting event:', err);
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const openEditEventModal = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      category: event.category,
      discount: event.discount || '',
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
      targetAudience: event.targetAudience || 'all',
      color: event.color || '#4F46E5'
    });
  };

  const colorOptions = [
    { color: '#4F46E5', name: 'Indigo' },
    { color: '#7C3AED', name: 'Purple' },
    { color: '#DB2777', name: 'Pink' },
    { color: '#DC2626', name: 'Red' },
    { color: '#EA580C', name: 'Orange' },
    { color: '#CA8A04', name: 'Yellow' },
    { color: '#16A34A', name: 'Green' },
    { color: '#0891B2', name: 'Cyan' },
    { color: '#2563EB', name: 'Blue' },
    { color: '#6366F1', name: 'Light Indigo' },
  ];

  const openEditCategoryModal = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '📦'
    });
  };

  const iconOptions = [
    { icon: '🔧', name: 'Repair' },
    { icon: '🏠', name: 'Home' },
    { icon: '💻', name: 'Technology' },
    { icon: '🚗', name: 'Automotive' },
    { icon: '🎨', name: 'Art & Design' },
    { icon: '📚', name: 'Education' },
    { icon: '🍔', name: 'Food' },
    { icon: '💼', name: 'Business' },
    { icon: '🏥', name: 'Healthcare' },
    { icon: '✈️', name: 'Travel' },
    { icon: '🎵', name: 'Music' },
    { icon: '🏋️', name: 'Fitness' },
    { icon: '🌿', name: 'Nature' },
    { icon: '🔌', name: 'Electrical' },
    { icon: '📱', name: 'Mobile' },
    { icon: '👔', name: 'Fashion' },
    { icon: '🛠️', name: 'Tools' },
    { icon: '🏗️', name: 'Construction' },
    { icon: '🎓', name: 'Academic' },
    { icon: '💇', name: 'Beauty' },
    { icon: '🧹', name: 'Cleaning' },
    { icon: '🔑', name: 'Security' },
    { icon: '📦', name: 'General' },
    { icon: '⚡', name: 'Energy' },
    { icon: '🎬', name: 'Entertainment' },
    { icon: '📷', name: 'Photography' },
    { icon: '🎮', name: 'Gaming' },
    { icon: '⚽', name: 'Sports' },
    { icon: '🎸', name: 'Musical' },
    { icon: '🍕', name: 'Restaurant' },
    { icon: '🌸', name: 'Floral' },
    { icon: '🐶', name: 'Pet Care' }
  ];

  const getIconName = (iconEmoji) => {
    const found = iconOptions.find(opt => opt.icon === iconEmoji);
    return found ? found.name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate('/admin/login')} className="btn-primary">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="header-actions">
            <span className="admin-name">
              {user.username || 'Admin'}
            </span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="stats-section">
        <h2>Overview</h2>
        <div className="stats-grid">
          <div className="stat-card clickable" onClick={handleShowAllUsers}>
            <div className="stat-icon users">👥</div>
            <div className="stat-info">
              <h3>{stats?.overview?.totalUsers || 0}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="stat-card clickable" onClick={handleShowAllSeekers}>
            <div className="stat-icon seekers">🔍</div>
            <div className="stat-info">
              <h3>{stats?.overview?.totalSeekers || 0}</h3>
              <p>Service Seekers</p>
            </div>
          </div>

          <div className="stat-card clickable" onClick={handleShowAllProviders}>
            <div className="stat-icon providers">🛠️</div>
            <div className="stat-info">
              <h3>{stats?.overview?.totalProviders || 0}</h3>
              <p>Service Providers</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon verified">✅</div>
            <div className="stat-info">
              <h3>{stats?.overview?.verifiedProviders || 0}</h3>
              <p>Verified Providers</p>
            </div>
          </div>

          <div className="stat-card clickable" onClick={handleShowAllServices}>
            <div className="stat-icon services">📋</div>
            <div className="stat-info">
              <h3>{stats?.overview?.totalServices || 0}</h3>
              <p>Total Services</p>
            </div>
          </div>

          <div className="stat-card clickable" onClick={handleShowCategories}>
            <div className="stat-icon categories">📁</div>
            <div className="stat-info">
              <h3>{stats?.overview?.totalCategories || 0}</h3>
              <p>Categories</p>
            </div>
          </div>

          <div className="stat-card clickable" onClick={handleShowEvents}>
            <div className="stat-icon events">🎉</div>
            <div className="stat-info">
              <h3>{allEvents.length}</h3>
              <p>Events & Offers</p>
            </div>
          </div>

          <div className="stat-card clickable" onClick={handleShowAllBookings}>
            <div className="stat-icon bookings">📅</div>
            <div className="stat-info">
              <h3>{stats?.overview?.totalBookings || 0}</h3>
              <p>Total Bookings</p>
            </div>
          </div>

          <div className="stat-card clickable" onClick={() => navigate('/admin/reports')}>
            <div className="stat-icon reports">⚠️</div>
            <div className="stat-info">
              <h3>{stats?.overview?.pendingReports || 0}</h3>
              <p>Pending Reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="activity-section">
        <div className="activity-grid">
          {/* Recent Users */}
          <div className="activity-card">
            <h3>Recent Users</h3>
            <div className="activity-list">
              {stats?.recentActivity?.recentUsers?.length > 0 ? (
                stats.recentActivity.recentUsers.map((user) => (
                  <div key={user._id} className="activity-item">
                    <div className="item-info">
                      <span className="item-name">{user.username}</span>
                      <span className="item-meta">{user.email}</span>
                    </div>
                    <span className={`badge badge-${user.role}`}>
                      {user.role}
                    </span>
                  </div>
                ))
              ) : (
                <p className="no-data">No recent users</p>
              )}
            </div>
          </div>

          {/* Recent Services */}
          <div className="activity-card">
            <h3>Recent Services</h3>
            <div className="activity-list">
              {stats?.recentActivity?.recentServices?.length > 0 ? (
                stats.recentActivity.recentServices.map((service) => (
                  <div key={service._id} className="activity-item">
                    <div className="item-info">
                      <span className="item-name">{service.title}</span>
                      <span className="item-meta">
                        by {service.provider?.businessName || service.provider?.username}
                      </span>
                    </div>
                    <span className="badge badge-category">
                      {service.category?.name}
                    </span>
                  </div>
                ))
              ) : (
                <p className="no-data">No recent services</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Breakdown */}
      {stats?.analytics?.categoryBreakdown?.length > 0 && (
        <section className="analytics-section">
          <h2>Services by Category</h2>
          <div className="category-breakdown">
            {stats.analytics.categoryBreakdown.map((cat) => (
              <div key={cat._id} className="category-stat">
                <span className="category-name">{cat.name}</span>
                <div className="category-bar">
                  <div
                    className="category-fill"
                    style={{
                      width: `${(cat.count / stats.overview.totalServices) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="category-count">{cat.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* User Details Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>All Users ({allUsers.length})</h2>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {loadingUsers ? (
                <div className="loading">Loading users...</div>
              ) : (
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Verified</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((user) => (
                        <tr key={user._id}>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`badge badge-${user.role}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>{user.phone || 'N/A'}</td>
                          <td>{user.location || 'N/A'}</td>
                          <td>
                            {user.role === 'provider' ? (
                              user.isVerified ? '✅' : '❌'
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Service Details Modal */}
      {showServiceModal && (
        <div className="modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>All Services ({allServices.length})</h2>
              <button className="modal-close" onClick={() => setShowServiceModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {loadingServices ? (
                <div className="loading">Loading services...</div>
              ) : (
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Provider</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allServices.map((service) => (
                        <tr key={service._id}>
                          <td>{service.title}</td>
                          <td>
                            {service.provider?.businessName || service.provider?.username || 'N/A'}
                          </td>
                          <td>
                            <span className="badge badge-category">
                              {service.category?.name || 'N/A'}
                            </span>
                          </td>
                          <td>৳{service.pricing || 'N/A'}</td>
                          <td>
                            {service.location?.city && service.location?.area 
                              ? `${service.location.area}, ${service.location.city}` 
                              : 'N/A'}
                          </td>
                          <td>
                            <span className={`badge badge-${service.isActive ? 'provider' : 'seeker'}`}>
                              {service.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{new Date(service.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seeker Details Modal */}
      {showSeekerModal && (
        <div className="modal-overlay" onClick={() => setShowSeekerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>All Service Seekers ({allSeekers.length})</h2>
              <button className="modal-close" onClick={() => setShowSeekerModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {loadingSeekers ? (
                <div className="loading">Loading seekers...</div>
              ) : (
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allSeekers.map((seeker) => (
                        <tr key={seeker._id}>
                          <td>{seeker.username}</td>
                          <td>{seeker.email}</td>
                          <td>{seeker.phone || 'N/A'}</td>
                          <td>{seeker.location || 'N/A'}</td>
                          <td>{new Date(seeker.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Service Provider Details Modal */}
      {showProviderModal && (
        <div className="modal-overlay" onClick={() => setShowProviderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>All Service Providers ({allProviders.length})</h2>
              <button className="modal-close" onClick={() => setShowProviderModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {loadingProviders ? (
                <div className="loading">Loading providers...</div>
              ) : (
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Business Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Verified</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allProviders.map((provider) => (
                        <tr key={provider._id}>
                          <td>{provider.username}</td>
                          <td>{provider.businessName || 'N/A'}</td>
                          <td>{provider.email}</td>
                          <td>{provider.phone || 'N/A'}</td>
                          <td>
                            {provider.location?.city && provider.location?.area 
                              ? `${provider.location.area}, ${provider.location.city}` 
                              : provider.location?.city || 'N/A'}
                          </td>
                          <td>
                            {provider.isVerified ? '✓ Verified' : 'Not Verified'}
                          </td>
                          <td>{new Date(provider.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bookings Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>All Bookings ({allBookings.length})</h2>
              <button className="modal-close" onClick={() => setShowBookingModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {loadingBookings ? (
                <div className="loading">Loading bookings...</div>
              ) : (
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Seeker</th>
                        <th>Provider</th>
                        <th>Service</th>
                        <th>Scheduled Time</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allBookings.map((booking) => (
                        <tr key={booking._id}>
                          <td>{booking._id.slice(-8)}</td>
                          <td>
                            {booking.seeker?.username || 'N/A'}
                            <br />
                            <small>{booking.seeker?.email || ''}</small>
                          </td>
                          <td>
                            {booking.provider?.businessName || booking.provider?.username || 'N/A'}
                            <br />
                            <small>{booking.provider?.email || ''}</small>
                          </td>
                          <td>
                            {booking.service?.title || 'N/A'}
                            <br />
                            <small>${booking.service?.price || 'N/A'}</small>
                          </td>
                          <td>{new Date(booking.scheduledTime).toLocaleString()}</td>
                          <td>
                            <span className={`badge badge-${booking.status}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
          setCategoryForm({ name: '', description: '', icon: '📦' });
        }}>
          <div className="modal-content large-modal category-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Category Management</h2>
              <button className="modal-close" onClick={() => {
                setShowCategoryModal(false);
                setEditingCategory(null);
                setCategoryForm({ name: '', description: '', icon: '📦' });
              }}>✕</button>
            </div>
            <div className="modal-body">
              {loadingCategories ? (
                <div className="loading">Loading categories...</div>
              ) : (
                <>
                  <div className="category-form-section">
                    <h3>{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>
                    <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="category-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label style={{color: 'white'}}>Category Name *</label>
                          <input
                            type="text"
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                            placeholder="e.g., Plumbing, Cleaning, etc."
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label style={{color: 'white'}}>
                            Icon: <span className="selected-name">{categoryForm.icon} {getIconName(categoryForm.icon)}</span>
                          </label>
                          <div className="icon-picker">
                            {iconOptions.map((option) => (
                              <button
                                key={option.icon}
                                type="button"
                                className={`icon-option ${categoryForm.icon === option.icon ? 'selected' : ''}`}
                                onClick={() => setCategoryForm({...categoryForm, icon: option.icon})}
                                title={option.name}
                              >
                                {option.icon}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label style={{color: 'white'}}>Description</label>
                        <textarea
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                          placeholder="Brief description of this category"
                          rows="3"
                        />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn-primary">
                          {editingCategory ? '✓ Update Category' : '+ Create Category'}
                        </button>
                        {editingCategory && (
                          <button 
                            type="button" 
                            className="btn-secondary" 
                            onClick={() => {
                              setEditingCategory(null);
                              setCategoryForm({ name: '', description: '', icon: '📦' });
                            }}
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  <div className="categories-list-section">
                    <h3>Existing Categories ({allCategories.length})</h3>
                    <div className="categories-grid">
                      {allCategories.map((category) => (
                        <div key={category._id} className="category-card">
                          <div className="category-card-header">
                            <span className="category-icon-large">{category.icon || '📦'}</span>
                            <div className="category-card-info">
                              <h4>{category.name}</h4>
                              <p className="category-description">
                                {category.description || 'No description'}
                              </p>
                              <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                                {category.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="category-card-actions">
                            <button 
                              className="btn-edit" 
                              onClick={() => openEditCategoryModal(category)}
                              title="Edit category"
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              className="btn-delete" 
                              onClick={() => handleDeleteCategory(category._id)}
                              title="Delete category"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Events Management Modal */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content large event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 Events & Offers Management</h2>
              <button className="modal-close" onClick={() => setShowEventModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {loadingEvents ? (
                <div className="loading-spinner">Loading events...</div>
              ) : (
                <>
                  <div className="form-section">
                    <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
                    <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}>
                      <div className="form-row">
                        <div className="form-group">
                          <label style={{color: 'white'}}>Title *</label>
                          <input
                            type="text"
                            value={eventForm.title}
                            onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                            placeholder="e.g., Summer Sale, New Year Offer"
                            required
                            maxLength="100"
                          />
                        </div>
                        <div className="form-group">
                          <label style={{color: 'white'}}>Category *</label>
                          <input
                            type="text"
                            value={eventForm.category}
                            onChange={(e) => setEventForm({...eventForm, category: e.target.value})}
                            placeholder="e.g., Discount, Special Event"
                            required
                            maxLength="100"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label style={{color: 'white'}}>Description *</label>
                        <textarea
                          value={eventForm.description}
                          onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                          placeholder="Describe the event or offer details"
                          rows="4"
                          required
                          maxLength="1000"
                        />
                        <small>{eventForm.description.length}/1000 characters</small>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label style={{color: 'white'}}>Discount/Offer</label>
                          <input
                            type="text"
                            value={eventForm.discount}
                            onChange={(e) => setEventForm({...eventForm, discount: e.target.value})}
                            placeholder="e.g., 20% OFF, Up to $50"
                            maxLength="50"
                          />
                        </div>
                        <div className="form-group">
                          <label style={{color: 'white'}}>Target Audience *</label>
                          <select
                            value={eventForm.targetAudience}
                            onChange={(e) => setEventForm({...eventForm, targetAudience: e.target.value})}
                            required
                          >
                            <option value="all">All Users</option>
                            <option value="seeker">Seekers Only</option>
                            <option value="provider">Providers Only</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label style={{color: 'white'}}>Start Date *</label>
                          <input
                            type="date"
                            value={eventForm.startDate}
                            onChange={(e) => setEventForm({...eventForm, startDate: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label style={{color: 'white'}}>End Date *</label>
                          <input
                            type="date"
                            value={eventForm.endDate}
                            onChange={(e) => setEventForm({...eventForm, endDate: e.target.value})}
                            min={eventForm.startDate}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label style={{color: 'white'}}>
                          Card Color: <span className="color-preview" style={{backgroundColor: eventForm.color, color: 'white', padding: '2px 8px', borderRadius: '4px'}}>{eventForm.color}</span>
                        </label>
                        <div className="color-picker">
                          {colorOptions.map((option) => (
                            <button
                              key={option.color}
                              type="button"
                              className={`color-option ${eventForm.color === option.color ? 'selected' : ''}`}
                              style={{backgroundColor: option.color}}
                              onClick={() => setEventForm({...eventForm, color: option.color})}
                              title={option.name}
                            >
                              {eventForm.color === option.color && '✓'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn-primary">
                          {editingEvent ? '✓ Update Event' : '+ Create Event'}
                        </button>
                        {editingEvent && (
                          <button 
                            type="button" 
                            className="btn-secondary" 
                            onClick={() => {
                              setEditingEvent(null);
                              setEventForm({ 
                                title: '', 
                                description: '', 
                                category: '', 
                                discount: '', 
                                startDate: '', 
                                endDate: '', 
                                targetAudience: 'all',
                                color: '#4F46E5'
                              });
                            }}
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  <div className="events-list-section">
                    <h3>Existing Events ({allEvents.length})</h3>
                    <div className="events-grid">
                      {allEvents.map((event) => (
                        <div key={event._id} className="event-card" style={{borderLeft: `4px solid ${event.color}`}}>
                          <div className="event-card-header">
                            <div className="event-card-info">
                              <h4>{event.title}</h4>
                              <p className="event-category">{event.category}</p>
                              {event.discount && <span className="event-discount">💰 {event.discount}</span>}
                              <p className="event-description">{event.description}</p>
                              <div className="event-meta">
                                <span className="event-dates">
                                  📅 {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                </span>
                                <span className={`badge badge-${event.targetAudience}`}>
                                  {event.targetAudience === 'all' ? '👥 All Users' : event.targetAudience === 'seeker' ? '🔍 Seekers' : '🛠️ Providers'}
                                </span>
                                <span className={`status-badge ${event.isActive ? 'active' : 'inactive'}`}>
                                  {event.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="event-card-actions">
                            <button 
                              className="btn-edit" 
                              onClick={() => openEditEventModal(event)}
                              title="Edit event"
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              className="btn-delete" 
                              onClick={() => handleDeleteEvent(event._id)}
                              title="Delete event"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
