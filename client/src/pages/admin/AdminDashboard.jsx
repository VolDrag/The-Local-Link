import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '📦' });
  const [editingCategory, setEditingCategory] = useState(null);

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

          <div className="stat-card">
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

          <div className="stat-card">
            <div className="stat-icon bookings">📅</div>
            <div className="stat-info">
              <h3>{stats?.overview?.totalBookings || 0}</h3>
              <p>Total Bookings</p>
            </div>
          </div>

          <div className="stat-card">
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

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
          setCategoryForm({ name: '', description: '', icon: '📦' });
        }}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
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
                          <label>Category Name *</label>
                          <input
                            type="text"
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                            placeholder="e.g., Plumbing, Cleaning, etc."
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>
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
                        <label>Description</label>
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
    </div>
  );
};

export default AdminDashboard;
