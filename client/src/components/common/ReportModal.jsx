// Report Modal Component
import { useState } from 'react';
import PropTypes from 'prop-types';
import './ReportModal.css';

const ReportModal = ({ serviceId, serviceTitle, onClose, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    reason: '',
    details: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reportOptions = [
    { value: 'scam_or_fraud', label: 'Scam or Fraud', description: 'Suspected fraudulent activity or scam' },
    { value: 'poor_service_quality', label: 'Poor Service Quality', description: 'Service quality below expectations' },
    { value: 'unprofessional_behavior', label: 'Unprofessional Behavior', description: 'Rude or unprofessional conduct' },
    { value: 'pricing_issues', label: 'Pricing Issues', description: 'Hidden fees or price manipulation' },
    { value: 'no_response', label: 'No Response', description: 'Provider not responding to messages' },
    { value: 'safety_concerns', label: 'Safety Concerns', description: 'Safety or health concerns' },
    { value: 'duplicate_listing', label: 'Duplicate Listing', description: 'Same service posted multiple times' },
    { value: 'other', label: 'Other', description: 'Other reason (please explain)' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.reason) {
      setError('Please select a reason for reporting');
      return;
    }
    
    if (!formData.details.trim()) {
      setError('Please provide details about your report');
      return;
    }

    if (formData.details.trim().length < 20) {
      setError('Please provide at least 20 characters describing the issue');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the onSubmitSuccess callback with the report data
      await onSubmitSuccess({
        serviceId,
        reason: formData.reason,
        details: formData.details.trim()
      });
      
      // Close the modal on success
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <h2>Report Service</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="report-service-info">
          <p>Service: <strong>{serviceTitle}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label htmlFor="reason">Reason for Report *</label>
            <select
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">-- Select a reason --</option>
              {reportOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formData.reason && (
              <small className="option-description">
                {reportOptions.find(opt => opt.value === formData.reason)?.description}
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="details">Details *</label>
            <textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleChange}
              placeholder="Please provide detailed information about your report (minimum 20 characters)"
              rows="5"
              required
              maxLength="1000"
              className="form-textarea"
            />
            <small className="char-count">
              {formData.details.length}/1000 characters
            </small>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>

        <div className="report-disclaimer">
          <small>
            Your report will be reviewed by our team. We take all reports seriously and will investigate accordingly.
          </small>
        </div>
      </div>
    </div>
  );
};

ReportModal.propTypes = {
  serviceId: PropTypes.string.isRequired,
  serviceTitle: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmitSuccess: PropTypes.func.isRequired
};

export default ReportModal;
