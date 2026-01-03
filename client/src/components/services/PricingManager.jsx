// //####################################Rafi###############################################
//Feature 21: Dynamic Pricing Manager Component

import { useState } from 'react';
import { updateServicePricing } from '../../services/serviceService';
import './PricingManager.css';

const PricingManager = ({ service, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [pricingData, setPricingData] = useState({
    pricingType: service?.pricingType || 'fixed',
    hourlyRate: service?.hourlyRate || 0,
    weeklyRate: service?.weeklyRate || 0,
    monthlyRate: service?.monthlyRate || 0,
    projectRate: service?.projectRate || 0,
    fixedRate: service?.fixedRate || 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await updateServicePricing(service._id, pricingData);
      
      if (result.success) {
        setIsEditing(false);
        if (onUpdate) {
          onUpdate(); // Refresh parent component
        }
        alert('Pricing updated successfully!');
      }
    } catch (err) {
      console.error('Error updating pricing:', err);
      // Extract the actual error message from server response
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update pricing';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setPricingData({
      pricingType: service?.pricingType || 'fixed',
      hourlyRate: service?.hourlyRate || 0,
      weeklyRate: service?.weeklyRate || 0,
      monthlyRate: service?.monthlyRate || 0,
      projectRate: service?.projectRate || 0,
      fixedRate: service?.fixedRate || 0,
    });
    setIsEditing(false);
    setError('');
  };

  if (!isEditing) {
    return (
      <div className="pricing-display">
        <div className="pricing-info">
          <h4>Current Pricing</h4>
          <div className="pricing-details">
            <p>
              <strong>Type:</strong>{' '}
              <span className={`pricing-type ${service?.pricingType}`}>
                {service?.pricingType === 'hourly' && 'Hourly Rate'}
                {service?.pricingType === 'weekly' && 'Weekly Rate'}
                {service?.pricingType === 'monthly' && 'Monthly Rate'}
                {service?.pricingType === 'project' && 'Project Rate'}
                {service?.pricingType === 'fixed' && 'Fixed Rate'}
              </span>
            </p>
            {service?.pricingType === 'hourly' && (
              <p>
                <strong>Hourly Rate:</strong> ${service?.hourlyRate || 0}/hour
              </p>
            )}
            {service?.pricingType === 'weekly' && (
              <p>
                <strong>Weekly Rate:</strong> ${service?.weeklyRate || 0}/week
              </p>
            )}
            {service?.pricingType === 'monthly' && (
              <p>
                <strong>Monthly Rate:</strong> ${service?.monthlyRate || 0}/month
              </p>
            )}
            {service?.pricingType === 'project' && (
              <p>
                <strong>Project Rate:</strong> ${service?.projectRate || 0}/project
              </p>
            )}
            {service?.pricingType === 'fixed' && (
              <p>
                <strong>Fixed Rate:</strong> ${service?.fixedRate || service?.pricing || 0}
              </p>
            )}
          </div>
        </div>
        <button 
          className="btn-edit-pricing"
          onClick={() => setIsEditing(true)}
        >
          Update Pricing
        </button>
      </div>
    );
  }

  return (
    <div className="pricing-manager">
      <h4>Update Service Pricing</h4>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Pricing Type</label>
          <div className="pricing-type-selector">
            <label className="radio-option">
              <input
                type="radio"
                name="pricingType"
                value="fixed"
                checked={pricingData.pricingType === 'fixed'}
                onChange={(e) => setPricingData({ ...pricingData, pricingType: e.target.value })}
              />
              <span>Fixed Rate</span>
              <small>One-time payment for the entire service</small>
            </label>
            
            <label className="radio-option">
              <input
                type="radio"
                name="pricingType"
                value="hourly"
                checked={pricingData.pricingType === 'hourly'}
                onChange={(e) => setPricingData({ ...pricingData, pricingType: e.target.value })}
              />
              <span>Hourly Rate</span>
              <small>Payment based on hours worked</small>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="pricingType"
                value="weekly"
                checked={pricingData.pricingType === 'weekly'}
                onChange={(e) => setPricingData({ ...pricingData, pricingType: e.target.value })}
              />
              <span>Weekly Rate</span>
              <small>Payment per week of service</small>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="pricingType"
                value="monthly"
                checked={pricingData.pricingType === 'monthly'}
                onChange={(e) => setPricingData({ ...pricingData, pricingType: e.target.value })}
              />
              <span>Monthly Rate</span>
              <small>Payment per month of service</small>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="pricingType"
                value="project"
                checked={pricingData.pricingType === 'project'}
                onChange={(e) => setPricingData({ ...pricingData, pricingType: e.target.value })}
              />
              <span>Project Rate</span>
              <small>Payment per project completion</small>
            </label>
          </div>
        </div>

        {pricingData.pricingType === 'hourly' && (
          <div className="form-group">
            <label htmlFor="hourlyRate">Hourly Rate ($)</label>
            <input
              type="number"
              id="hourlyRate"
              min="0"
              step="0.01"
              value={pricingData.hourlyRate}
              onChange={(e) => setPricingData({ ...pricingData, hourlyRate: parseFloat(e.target.value) })}
              required
              placeholder="Enter hourly rate"
            />
          </div>
        )}

        {pricingData.pricingType === 'weekly' && (
          <div className="form-group">
            <label htmlFor="weeklyRate">Weekly Rate ($)</label>
            <input
              type="number"
              id="weeklyRate"
              min="0"
              step="0.01"
              value={pricingData.weeklyRate}
              onChange={(e) => setPricingData({ ...pricingData, weeklyRate: parseFloat(e.target.value) })}
              required
              placeholder="Enter weekly rate"
            />
          </div>
        )}

        {pricingData.pricingType === 'monthly' && (
          <div className="form-group">
            <label htmlFor="monthlyRate">Monthly Rate ($)</label>
            <input
              type="number"
              id="monthlyRate"
              min="0"
              step="0.01"
              value={pricingData.monthlyRate}
              onChange={(e) => setPricingData({ ...pricingData, monthlyRate: parseFloat(e.target.value) })}
              required
              placeholder="Enter monthly rate"
            />
          </div>
        )}

        {pricingData.pricingType === 'project' && (
          <div className="form-group">
            <label htmlFor="projectRate">Project Rate ($)</label>
            <input
              type="number"
              id="projectRate"
              min="0"
              step="0.01"
              value={pricingData.projectRate}
              onChange={(e) => setPricingData({ ...pricingData, projectRate: parseFloat(e.target.value) })}
              required
              placeholder="Enter project rate"
            />
          </div>
        )}

        {pricingData.pricingType === 'fixed' && (
          <div className="form-group">
            <label htmlFor="fixedRate">Fixed Rate ($)</label>
            <input
              type="number"
              id="fixedRate"
              min="0"
              step="0.01"
              value={pricingData.fixedRate}
              onChange={(e) => setPricingData({ ...pricingData, fixedRate: parseFloat(e.target.value) })}
              required
              placeholder="Enter fixed rate"
            />
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-save"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Pricing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PricingManager;
