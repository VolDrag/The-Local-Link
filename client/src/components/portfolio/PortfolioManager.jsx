// ============= Feature 25: Provider Portfolio Showcase - START =============
// Portfolio Manager Component
// Allows providers to upload, manage and showcase their work portfolio
import React, { useState, useEffect } from 'react';
import './PortfolioManager.css';
import { useAuth } from '../../context/AuthContext';

const PortfolioManager = () => {
  // STEP 1: Get user information from AuthContext
  const { user } = useAuth();
  
  // STEP 2: State variables - storage boxes for our data
  const [portfolio, setPortfolio] = useState([]); // All uploaded works
  const [selectedFiles, setSelectedFiles] = useState([]); // Images user selected to upload
  const [previews, setPreviews] = useState([]); // Preview URLs to show images
  const [workTitle, setWorkTitle] = useState(''); // Title of the work
  const [workDescription, setWorkDescription] = useState(''); // Description of the work
  const [loading, setLoading] = useState(false); // Is upload in progress?
  const [message, setMessage] = useState({ text: '', type: '' }); // Success/error messages
  const [isDragging, setIsDragging] = useState(false); // Is user dragging files?
  const [selectedImage, setSelectedImage] = useState(null); // Image for modal view

  // STEP 3: Fetch portfolio when component loads
  useEffect(() => {
    if (user?._id) {
      fetchPortfolio();
    }
  }, [user]);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/portfolio/${user._id}`);
      const data = await response.json();
      
      if (data.success) {
        setPortfolio(data.data.portfolio || []);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  // STEP 4: Handle file selection from file picker
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  // STEP 5: Add selected files and create previews
  const addFiles = (files) => {
    // Filter to only keep image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setMessage({ text: 'Please select image files only', type: 'error' });
      return;
    }

    // Check if adding these files would exceed 3 images limit
    const totalFiles = selectedFiles.length + imageFiles.length;
    if (totalFiles > 3) {
      setMessage({ text: 'Maximum 3 images allowed per work', type: 'error' });
      return;
    }

    setSelectedFiles(prev => [...prev, ...imageFiles]);

    // Create preview images (so user can see them before uploading)
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // STEP 6: Handle drag over event (when user drags files over upload area)
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // STEP 7: Handle drag leave event (when user stops dragging over upload area)
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // STEP 8: Handle file drop (when user drops files into upload area)
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  // STEP 9: Remove preview - when user clicks X on a preview image
  const removePreview = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // STEP 10: Open image in modal for fullscreen view
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // STEP 11: Close image modal
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // STEP 12: Upload work to server
  const handleUpload = async () => {
    // Check if images are selected
    if (selectedFiles.length === 0) {
      setMessage({ text: 'Please select at least 1 image (max 3)', type: 'error' });
      return;
    }

    // Check if work title is provided and valid
    if (!workTitle || workTitle.trim().length < 5) {
      setMessage({ text: 'Please provide a work title (at least 5 characters)', type: 'error' });
      return;
    }

    // Check if work description is provided and valid
    if (!workDescription || workDescription.trim().length < 10) {
      setMessage({ text: 'Please provide a work description (at least 10 characters)', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const formData = new FormData();
      
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      formData.append('title', workTitle);
      formData.append('description', workDescription);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/portfolio/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: 'Portfolio work added successfully!', type: 'success' });
        setPortfolio(data.data.portfolio);
        
        // Clear form
        setSelectedFiles([]);
        setPreviews([]);
        setWorkTitle('');
        setWorkDescription('');
      } else {
        setMessage({ text: data.message || 'Upload failed', type: 'error' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ text: 'Error uploading portfolio work', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // STEP 13: Delete a work from portfolio
  const handleDeleteWork = async (index) => {
    // Ask for confirmation before deleting
    if (!window.confirm('Are you sure you want to delete this work? All images will be removed.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/portfolio/${index}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: 'Work deleted successfully', type: 'success' });
        setPortfolio(data.data.portfolio);
      } else {
        setMessage({ text: data.message || 'Delete failed', type: 'error' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ text: 'Error deleting work', type: 'error' });
    }
  };
  // STEP 14: Update work title and description
  const handleUpdateWork = async (index) => {
    const work = portfolio[index];
    
    // Ask user for new title
    const newTitle = prompt('Enter work title:', work?.title || '');
    if (newTitle === null) return; // User cancelled
    
    // Ask user for new description
    const newDescription = prompt('Enter work description:', work?.description || '');
    if (newDescription === null) return; // User cancelled

    // Validate title length
    if (newTitle.trim().length < 5) {
      setMessage({ text: 'Title must be at least 5 characters', type: 'error' });
      return;
    }

    // Validate description length
    if (newDescription.trim().length < 10) {
      setMessage({ text: 'Description must be at least 10 characters', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/portfolio/${index}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle, description: newDescription })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: 'Work updated successfully', type: 'success' });
        setPortfolio(data.data.portfolio);
      } else {
        setMessage({ text: data.message || 'Update failed', type: 'error' });
      }
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ text: 'Error updating work', type: 'error' });
    }
  };

  return (
    <div className="portfolio-manager">
      <h2>Portfolio Management</h2>

      {message.text && (
        <div className={`portfolio-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Upload Section */}
      <div className="portfolio-upload-section">
        <h3>Upload New Work</h3>
        
        {/* Work Title Input */}
        <div className="work-input-group">
          <label htmlFor="work-title">Work Title *</label>
          <input
            id="work-title"
            type="text"
            placeholder="e.g., Living Room Renovation"
            value={workTitle}
            onChange={(e) => setWorkTitle(e.target.value)}
            minLength={5}
            required
            className="work-title-input"
          />
          <small className="char-count" style={{ 
            color: (workTitle?.length || 0) < 5 ? '#e74c3c' : '#27ae60'
          }}>
            {workTitle?.length || 0}/5 characters minimum
          </small>
        </div>

        {/* Work Description Input */}
        <div className="work-input-group">
          <label htmlFor="work-description">Work Description *</label>
          <textarea
            id="work-description"
            placeholder="Describe this work project..."
            value={workDescription}
            onChange={(e) => setWorkDescription(e.target.value)}
            minLength={10}
            required
            className="work-description-input"
            rows={4}
          />
          <small className="char-count" style={{ 
            color: (workDescription?.length || 0) < 10 ? '#e74c3c' : '#27ae60'
          }}>
            {workDescription?.length || 0}/10 characters minimum
          </small>
        </div>

        {/* Image Upload Area */}
        <div
          className={`upload-area ${isDragging ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <div className="upload-icon">📸</div>
          <p><strong>Click to upload</strong> or drag and drop</p>
          <p>PNG, JPG, GIF, WEBP up to 10MB</p>
          <p style={{ color: '#3498db', fontWeight: 'bold' }}>
            Upload 1-3 images for this work
          </p>
          <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
            {selectedFiles.length}/3 images selected
          </p>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
          />
        </div>

        {/* Image Previews */}
        {previews.length > 0 && (
          <div className="image-previews">
            {previews.map((preview, index) => (
              <div key={index} className="preview-item">
                <img src={preview} alt={`Preview ${index + 1}`} className="preview-image" />
                <button
                  className="remove-preview"
                  onClick={() => removePreview(index)}
                  title="Remove image"
                >
                  ×
                </button>
                <div className="image-number">Image {index + 1}</div>
              </div>
            ))}
          </div>
        )}

        {selectedFiles.length > 0 && (
          <button
            className="submit-portfolio-button"
            onClick={handleUpload}
            disabled={loading || !workTitle || workTitle.length < 5 || !workDescription || workDescription.length < 10}
          >
            {loading ? 'Uploading...' : `Add Portfolio Work (${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''})`}
          </button>
        )}
      </div>

      {/* Current Portfolio Section */}
      <div className="current-portfolio-section">
        <h3>Current Portfolio ({portfolio.length} work{portfolio.length !== 1 ? 's' : ''})</h3>
        
        {portfolio.length === 0 ? (
          <div className="empty-portfolio">
            <div className="empty-portfolio-icon">🖼️</div>
            <p>No portfolio works yet. Upload images to showcase your work!</p>
          </div>
        ) : (
          <div className="portfolio-grid">
            {portfolio.map((work, index) => (
              <div key={index} className="portfolio-card">
                <div className="portfolio-card-images">
                  {work.images && work.images.map((imageUrl, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={`http://localhost:5000/${imageUrl}`}
                      alt={`${work.title} - Image ${imgIndex + 1}`}
                      className="portfolio-card-image"
                      onClick={() => openImageModal(`http://localhost:5000/${imageUrl}`)}
                    />
                  ))}
                </div>
                <div className="portfolio-card-content">
                  <h4 className="portfolio-card-title">{work.title}</h4>
                  <p className="portfolio-card-description">
                    {work.description}
                  </p>
                  <p className="portfolio-card-meta">
                    {work.images?.length || 0} image{work.images?.length !== 1 ? 's' : ''}
                  </p>
                  <div className="portfolio-card-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleUpdateWork(index)}
                      title="Edit work title and description"
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteWork(index)}
                      title="Delete this work"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeImageModal}>×</button>
            <img src={selectedImage} alt="Portfolio item full view" className="modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
// ============= Feature 25: Provider Portfolio Showcase - END =============
