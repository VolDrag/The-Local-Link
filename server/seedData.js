/**
 * Database Seed Script
 * 
 * This script populates the MongoDB database with dummy data for testing and development.
 * Created to enable testing of the search/filter functionality and service listings.
 * 
 * What it creates:
 * - 3 service categories (Home Repair, Beauty & Wellness, Technology)
 * - 5 provider users with complete profiles (avatars, bios, portfolios)
 * - 5 seeker users for submitting reviews
 * - 15 services across different categories, locations, and price ranges
 * - 57+ reviews with ratings (3-5 stars) distributed across all services
 * 
 * Key Features:
 * - Automatic password hashing via User model pre-save hook
 * - Random service images from picsum.photos
 * - Bangladesh-specific locations (Dhaka, Chittagong, Sylhet)
 * - Unique service-user combinations for reviews (enforced by compound index)
 * - BDT pricing with various pricing models (hourly, fixed, per project)
 * 
 * Usage: node server/seedData.js
 * WARNING: This will clear ALL existing data before seeding
 * 
 * @author Ifty
 * @date December 9, 2025
 */

// ifty
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';
import Service from './models/Service.js';
import Category from './models/Category.js';
import Review from './models/Review.js';

// ES6 modules don't have __dirname by default, so we create it manually
// This is needed to resolve the .env file path correctly
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data to ensure clean state
    // WARNING: This deletes ALL data from the database
    await User.deleteMany({});
    await Service.deleteMany({});
    await Category.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data');

    // Create Categories
    const categories = await Category.insertMany([
      {
        name: 'Home Repair',
        description: 'Plumbing, electrical, carpentry and other home maintenance services',
        icon: '🔧'
      },
      {
        name: 'Beauty & Wellness',
        description: 'Salons, spas, massage and beauty services',
        icon: '💆'
      },
      {
        name: 'Technology',
        description: 'Computer repair, phone repair, IT support',
        icon: '💻'
      }
    ]);
    console.log('Categories created');

    // Create Provider Users
    const providers = await User.insertMany([
      {
        username: 'ahmed_plumber',
        name: 'Ahmed Hassan',
        email: 'ahmed@example.com',
        password: 'password123',
        role: 'provider',
        bio: 'Professional plumber with 10+ years of experience',
        phone: '+880-1712-345678',
        isVerified: true,
        availability: 'online',
        portfolio: [
          { title: 'Bathroom Renovation', image: 'https://picsum.photos/400/300?random=1' },
          { title: 'Kitchen Sink Install', image: 'https://picsum.photos/400/300?random=2' }
        ]
      },
      {
        username: 'fatima_beauty',
        name: 'Fatima Rahman',
        email: 'fatima@example.com',
        password: 'password123',
        role: 'provider',
        bio: 'Expert beautician and makeup artist',
        phone: '+880-1812-345678',
        isVerified: true,
        availability: 'online',
        portfolio: [
          { title: 'Bridal Makeup', image: 'https://picsum.photos/400/300?random=3' },
          { title: 'Hair Styling', image: 'https://picsum.photos/400/300?random=4' }
        ]
      },
      {
        username: 'karim_tech',
        name: 'Karim Ali',
        email: 'karim@example.com',
        password: 'password123',
        role: 'provider',
        bio: 'Certified computer technician and IT specialist',
        phone: '+880-1912-345678',
        isVerified: true,
        availability: 'busy',
        portfolio: [
          { title: 'PC Build', image: 'https://picsum.photos/400/300?random=5' },
          { title: 'Network Setup', image: 'https://picsum.photos/400/300?random=6' }
        ]
      },
      {
        username: 'nadia_electric',
        name: 'Nadia Islam',
        email: 'nadia@example.com',
        password: 'password123',
        role: 'provider',
        bio: 'Experienced electrician for home and office',
        phone: '+880-1612-345678',
        isVerified: false,
        availability: 'online'
      },
      {
        username: 'rashid_carpenter',
        name: 'Rashid Khan',
        email: 'rashid@example.com',
        password: 'password123',
        role: 'provider',
        bio: 'Master carpenter specializing in custom furniture',
        phone: '+880-1512-345678',
        isVerified: true,
        availability: 'offline'
      }
    ]);
    console.log('Providers created');

    // Create Services
    const services = await Service.insertMany([
      {
        title: 'Professional Plumbing Services',
        description: 'Complete plumbing solutions including repairs, installations, and maintenance. Available for emergencies 24/7.',
        category: categories[0]._id,
        provider: providers[0]._id,
        location: { city: 'Dhaka', area: 'Dhanmondi', country: 'Bangladesh' },
        pricing: 1500,
        pricingUnit: 'hour',
        images: ['https://picsum.photos/800/600?random=10', 'https://picsum.photos/800/600?random=11'],
        isActive: true
      },
      {
        title: 'Bridal Makeup & Hair Styling',
        description: 'Professional bridal makeup and hair styling for your special day. Using premium products.',
        category: categories[1]._id,
        provider: providers[1]._id,
        location: { city: 'Dhaka', area: 'Gulshan', country: 'Bangladesh' },
        pricing: 8000,
        pricingUnit: 'fixed',
        images: ['https://picsum.photos/800/600?random=12', 'https://picsum.photos/800/600?random=13'],
        specialOffer: {
          description: '20% off for December bookings',
          expiryDate: new Date('2025-12-31')
        },
        isActive: true
      },
      {
        title: 'Computer Repair & Upgrade',
        description: 'Expert computer repair, hardware upgrade, and software troubleshooting services.',
        category: categories[2]._id,
        provider: providers[2]._id,
        location: { city: 'Dhaka', area: 'Mirpur', country: 'Bangladesh' },
        pricing: 1000,
        pricingUnit: 'fixed',
        images: ['https://picsum.photos/800/600?random=14'],
        isActive: true
      },
      {
        title: 'Home Electrical Installation',
        description: 'Safe and certified electrical installations and repairs for homes and offices.',
        category: categories[0]._id,
        provider: providers[3]._id,
        location: { city: 'Chittagong', area: 'Agrabad', country: 'Bangladesh' },
        pricing: 1200,
        pricingUnit: 'hour',
        images: ['https://picsum.photos/800/600?random=15'],
        isActive: true
      },
      {
        title: 'Custom Furniture Making',
        description: 'Handcrafted custom furniture for your home. Quality wood and professional finish.',
        category: categories[0]._id,
        provider: providers[4]._id,
        location: { city: 'Dhaka', area: 'Uttara', country: 'Bangladesh' },
        pricing: 25000,
        pricingUnit: 'project',
        images: ['https://picsum.photos/800/600?random=16', 'https://picsum.photos/800/600?random=17'],
        isActive: true
      },
      {
        title: 'AC Repair & Servicing',
        description: 'Air conditioner repair, servicing, and installation. All brands supported.',
        category: categories[0]._id,
        provider: providers[0]._id,
        location: { city: 'Dhaka', area: 'Banani', country: 'Bangladesh' },
        pricing: 800,
        pricingUnit: 'fixed',
        images: ['https://picsum.photos/800/600?random=18'],
        isActive: true
      },
      {
        title: 'Spa & Massage Therapy',
        description: 'Relaxing spa treatments and therapeutic massage services. Professional therapists.',
        category: categories[1]._id,
        provider: providers[1]._id,
        location: { city: 'Sylhet', area: 'Zindabazar', country: 'Bangladesh' },
        pricing: 2500,
        pricingUnit: 'hour',
        images: ['https://picsum.photos/800/600?random=19'],
        specialOffer: {
          description: 'Buy 3 sessions, get 1 free',
          expiryDate: new Date('2025-12-25')
        },
        isActive: true
      },
      {
        title: 'Laptop Screen Replacement',
        description: 'Quick laptop screen replacement service. Original and compatible screens available.',
        category: categories[2]._id,
        provider: providers[2]._id,
        location: { city: 'Dhaka', area: 'Mohakhali', country: 'Bangladesh' },
        pricing: 4500,
        pricingUnit: 'fixed',
        images: ['https://picsum.photos/800/600?random=20'],
        isActive: true
      },
      {
        title: 'Drain Cleaning Service',
        description: 'Professional drain cleaning and unclogging services for kitchen and bathroom.',
        category: categories[0]._id,
        provider: providers[0]._id,
        location: { city: 'Chittagong', area: 'Panchlaish', country: 'Bangladesh' },
        pricing: 1000,
        pricingUnit: 'fixed',
        images: ['https://picsum.photos/800/600?random=21'],
        isActive: true
      },
      {
        title: 'Party Makeup Service',
        description: 'Glamorous party makeup for all occasions. Home service available.',
        category: categories[1]._id,
        provider: providers[1]._id,
        location: { city: 'Dhaka', area: 'Dhanmondi', country: 'Bangladesh' },
        pricing: 3500,
        pricingUnit: 'fixed',
        images: ['https://picsum.photos/800/600?random=22'],
        isActive: true
      },
      {
        title: 'Network Setup & Configuration',
        description: 'Home and office network setup, WiFi configuration, and troubleshooting.',
        category: categories[2]._id,
        provider: providers[2]._id,
        location: { city: 'Dhaka', area: 'Gulshan', country: 'Bangladesh' },
        pricing: 2000,
        pricingUnit: 'fixed',
        images: ['https://picsum.photos/800/600?random=23'],
        isActive: true
      },
      {
        title: 'Door & Window Repair',
        description: 'Repair and maintenance of wooden and aluminum doors and windows.',
        category: categories[0]._id,
        provider: providers[4]._id,
        location: { city: 'Dhaka', area: 'Mirpur', country: 'Bangladesh' },
        pricing: 1500,
        pricingUnit: 'fixed',
        images: ['https://picsum.photos/800/600?random=24'],
        isActive: true
      },
      {
        title: 'Hair Treatment & Spa',
        description: 'Deep conditioning hair treatments and scalp spa. Premium products used.',
        category: categories[1]._id,
        provider: providers[1]._id,
        location: { city: 'Dhaka', area: 'Uttara', country: 'Bangladesh' },
        pricing: 3000,
        pricingUnit: 'fixed',
        images: ['https://picsum.photos/800/600?random=25'],
        isActive: true
      },
      {
        title: 'Data Recovery Service',
        description: 'Professional data recovery from hard drives, SSDs, and memory cards.',
        category: categories[2]._id,
        provider: providers[2]._id,
        location: { city: 'Chittagong', area: 'Nasirabad', country: 'Bangladesh' },
        pricing: 5000,
        pricingUnit: 'project',
        images: ['https://picsum.photos/800/600?random=26'],
        isActive: true
      },
      {
        title: 'Bathroom Renovation',
        description: 'Complete bathroom renovation including plumbing, tiling, and fixtures.',
        category: categories[0]._id,
        provider: providers[0]._id,
        location: { city: 'Dhaka', area: 'Banani', country: 'Bangladesh' },
        pricing: 75000,
        pricingUnit: 'project',
        images: ['https://picsum.photos/800/600?random=27', 'https://picsum.photos/800/600?random=28'],
        isActive: true
      }
    ]);
    console.log('Services created');

    // Create Seeker Users for reviews
    // These users will be randomly assigned to write reviews for services
    const seekers = await User.insertMany([
      { username: 'sadia_a', name: 'Sadia Ahmed', email: 'sadia@example.com', password: 'password123', role: 'seeker' },
      { username: 'rafi_i', name: 'Rafi Islam', email: 'rafi@example.com', password: 'password123', role: 'seeker' },
      { username: 'tasnim_k', name: 'Tasnim Khan', email: 'tasnim@example.com', password: 'password123', role: 'seeker' },
      { username: 'mehedi_h', name: 'Mehedi Hasan', email: 'mehedi@example.com', password: 'password123', role: 'seeker' },
      { username: 'lamia_s', name: 'Lamia Sultana', email: 'lamia@example.com', password: 'password123', role: 'seeker' }
    ]);
    console.log('Seekers created');

    // Create Reviews for each service
    // Each user can only review a service once (enforced by unique index on service+user)
    const reviews = [];
    for (const service of services) {
      const numReviews = Math.floor(Math.random() * 3) + 3; // 3-5 reviews per service
      const usedSeekers = new Set(); // Track used seekers for this service to avoid duplicates
      
      for (let i = 0; i < numReviews; i++) {
        let randomSeeker;
        let attempts = 0;
        
        // Find a seeker that hasn't reviewed this service yet
        do {
          randomSeeker = seekers[Math.floor(Math.random() * seekers.length)];
          attempts++;
          if (attempts > 20) break; // Prevent infinite loop
        } while (usedSeekers.has(randomSeeker._id.toString()));
        
        // Skip if we couldn't find a unique seeker
        if (usedSeekers.has(randomSeeker._id.toString())) continue;
        
        usedSeekers.add(randomSeeker._id.toString());
        const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
        
        const reviewTexts = [
          'Excellent service! Very professional and timely.',
          'Great work, highly recommended!',
          'Good service but a bit expensive.',
          'Very satisfied with the quality of work.',
          'Professional and friendly. Will use again!',
          'Quick response and good results.',
          'Average service, nothing special.',
          'Outstanding work! Exceeded expectations.',
          'Good value for money.',
          'Reliable and trustworthy service provider.'
        ];
        
        reviews.push({
          service: service._id,
          user: randomSeeker._id,
          rating: rating,
          comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)]
        });
      }
    }
    
    await Review.insertMany(reviews);
    console.log(`${reviews.length} reviews created`);

    console.log('\n✅ Database seeded successfully!');
    console.log(`📦 Created:`);
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${providers.length} providers`);
    console.log(`   - ${seekers.length} seekers`);
    console.log(`   - ${services.length} services`);
    console.log(`   - ${reviews.length} reviews`);
    console.log('\n🌐 Visit http://localhost:3000/services to see the services!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

connectDB().then(seedData);
