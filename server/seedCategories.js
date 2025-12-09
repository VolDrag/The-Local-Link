//##################Rafi#########################
// The-Local-Link/server/seedCategories.js
// Seed Categories Script
// Run this script to populate the database with initial categories
// Usage: node seedCategories.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';

dotenv.config();

const categories = [
  {
    name: 'Plumbers',
    description: 'Professional plumbing services for residential and commercial properties',
    icon: '🔧',
    isActive: true,
  },
  {
    name: 'Electricians',
    description: 'Licensed electrical services and repairs',
    icon: '⚡',
    isActive: true,
  },
  {
    name: 'Cleaners',
    description: 'Home and office cleaning services',
    icon: '🧹',
    isActive: true,
  },
  {
    name: 'Internet Service Providers',
    description: 'Internet and network connectivity services',
    icon: '🌐',
    isActive: true,
  },
  {
    name: 'Salons & Beauty',
    description: 'Hair, beauty, and grooming services',
    icon: '💇',
    isActive: true,
  },
  {
    name: 'Carpenters',
    description: 'Woodworking and furniture services',
    icon: '🪚',
    isActive: true,
  },
  {
    name: 'Painters',
    description: 'Interior and exterior painting services',
    icon: '🎨',
    isActive: true,
  },
  {
    name: 'Movers',
    description: 'Moving and relocation services',
    icon: '📦',
    isActive: true,
  },
  {
    name: 'Gardeners',
    description: 'Lawn care and gardening services',
    icon: '🌱',
    isActive: true,
  },
  {
    name: 'Tutors',
    description: 'Educational and tutoring services',
    icon: '📚',
    isActive: true,
  },
  {
    name: 'Pet Services',
    description: 'Pet grooming, walking, and care services',
    icon: '🐾',
    isActive: true,
  },
  {
    name: 'Handyman',
    description: 'General home repair and maintenance services',
    icon: '🔨',
    isActive: true,
  },
];

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categories created successfully!`);

    // Display created categories
    console.log('\n📋 Created Categories:');
    createdCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.icon} ${cat.name} (ID: ${cat._id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
