// #ifty - Categories browse page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../../services/serviceService';
import CategoryCard from '../../components/services/CategoryCard';
import Breadcrumb from '../../components/common/Breadcrumb';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="categories-page">
      <Breadcrumb />
      
      <div className="categories-page-header">
        <h1>Browse by Category</h1>
        <p className="categories-page-subtitle">
          Explore services by category to find what you need
        </p>
      </div>

      {loading ? (
        <div className="categories-loading">
          <div className="loader"></div>
          <p>Loading categories...</p>
        </div>
      ) : categories.length > 0 ? (
        <div className="categories-grid">
          {categories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      ) : (
        <div className="no-categories">
          <p>No categories available at the moment.</p>
          <button onClick={() => navigate('/services')} className="btn-browse-all">
            Browse All Services
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
