// Admin Reports Management Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import './AdminReports.css';

const AdminReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllReports(filterStatus);
      setReports(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setAdminResponse(report.adminResponse || '');
  };

  const handleUpdateReport = async (reportId, status) => {
    try {
      setUpdating(true);
      await adminService.updateReport(reportId, { 
        status,
        adminResponse: adminResponse.trim() || undefined
      });
      alert(`Report ${status === 'resolved' ? 'resolved' : 'updated'} successfully! User has been notified.`);
      setSelectedReport(null);
      setAdminResponse('');
      fetchReports();
    } catch (err) {
      alert(err.message || 'Failed to update report');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await adminService.deleteReport(reportId);
      alert('Report deleted successfully');
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      alert(err.message || 'Failed to delete report');
    }
  };

  const getReasonLabel = (reason) => {
    const labels = {
      scam_or_fraud: 'Scam or Fraud',
      poor_service_quality: 'Poor Service Quality',
      unprofessional_behavior: 'Unprofessional Behavior',
      pricing_issues: 'Pricing Issues',
      no_response: 'No Response',
      safety_concerns: 'Safety Concerns',
      duplicate_listing: 'Duplicate Listing',
      other: 'Other'
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return (
      <div className="admin-reports-container">
        <div className="loading">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="admin-reports-container">
      <div className="reports-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1>📋 Report Management</h1>
        </div>
        <div className="filter-controls">
          <label>Filter by Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="">All Reports</option>
            <option value="pending_review">Pending Review</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="reports-stats">
        <div className="stat-card">
          <span className="stat-number">{reports.length}</span>
          <span className="stat-label">Total Reports</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {reports.filter(r => r.status === 'pending_review').length}
          </span>
          <span className="stat-label">Pending Review</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {reports.filter(r => r.status === 'resolved').length}
          </span>
          <span className="stat-label">Resolved</span>
        </div>
      </div>

      <div className="reports-table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Reporter</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No reports found</td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report._id}>
                  <td className="service-cell">
                    {report.reportedService?.title || 'N/A'}
                  </td>
                  <td>{report.reporter?.username || 'Unknown'}</td>
                  <td>
                    <span className="reason-badge">
                      {getReasonLabel(report.reason)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${report.status}`}>
                      {report.status === 'pending_review' ? 'Pending' : 'Resolved'}
                    </span>
                  </td>
                  <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => handleViewReport(report)}
                      className="btn-view"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Report Details</h2>
              <button 
                className="close-btn" 
                onClick={() => setSelectedReport(null)}
              >
                ×
              </button>
            </div>

            <div className="report-details">
              <div className="detail-row">
                <strong>Service:</strong>
                <span>{selectedReport.reportedService?.title || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <strong>Reporter:</strong>
                <span>{selectedReport.reporter?.username} ({selectedReport.reporter?.email})</span>
              </div>
              <div className="detail-row">
                <strong>Reason:</strong>
                <span className="reason-badge">{getReasonLabel(selectedReport.reason)}</span>
              </div>
              <div className="detail-row">
                <strong>Status:</strong>
                <span className={`status-badge ${selectedReport.status}`}>
                  {selectedReport.status === 'pending_review' ? 'Pending Review' : 'Resolved'}
                </span>
              </div>
              <div className="detail-row">
                <strong>Reported On:</strong>
                <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
              </div>
              
              <div className="detail-section">
                <strong>Details from Reporter:</strong>
                <p className="report-text">{selectedReport.details}</p>
              </div>

              {selectedReport.adminResponse && (
                <div className="detail-section admin-response-display">
                  <strong>Previous Admin Response:</strong>
                  <p className="report-text">{selectedReport.adminResponse}</p>
                </div>
              )}

              <div className="detail-section">
                <strong>Admin Response:</strong>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Write your response to the reporter (optional)..."
                  rows="4"
                  className="admin-response-input"
                  maxLength="1000"
                />
                <small className="char-count">{adminResponse.length}/1000</small>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => handleDeleteReport(selectedReport._id)}
                  className="btn-delete"
                  disabled={updating}
                >
                  Delete
                </button>
                {selectedReport.status === 'pending_review' && (
                  <button
                    onClick={() => handleUpdateReport(selectedReport._id, 'resolved')}
                    className="btn-resolve"
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Resolve & Notify User'}
                  </button>
                )}
                {adminResponse.trim() && (
                  <button
                    onClick={() => handleUpdateReport(selectedReport._id, selectedReport.status)}
                    className="btn-respond"
                    disabled={updating}
                  >
                    {updating ? 'Sending...' : 'Send Response to User'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
