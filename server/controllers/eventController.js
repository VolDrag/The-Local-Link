import asyncHandler from 'express-async-handler';
import Event from '../models/Event.js';
import { createNotification } from './notificationController.js';
import User from '../models/User.js';

// @desc    Get all active events for users
// @route   GET /api/events
// @access  Public or Private (based on targetAudience filtering)
export const getActiveEvents = asyncHandler(async (req, res) => {
  try {
    const userRole = req.user ? req.user.role : null;
    
    // Build query for active events
    const query = { isActive: true };
    
    // Filter by target audience based on user role
    if (userRole === 'seeker') {
      query.targetAudience = { $in: ['all', 'seeker'] };
    } else if (userRole === 'provider') {
      query.targetAudience = { $in: ['all', 'provider'] };
    } else {
      // For non-logged-in users or admins, show all events
      query.targetAudience = 'all';
    }
    
    const events = await Event.find(query)
      .sort({ startDate: -1 })
      .select('-createdBy');
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching active events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = asyncHandler(async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Failed to fetch event' });
  }
});

// ============ ADMIN ROUTES ============

// @desc    Get all events (for admin)
// @route   GET /api/admin/events
// @access  Private/Admin
export const getAllEvents = asyncHandler(async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching all events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// @desc    Create new event
// @route   POST /api/admin/events
// @access  Private/Admin
export const createEvent = asyncHandler(async (req, res) => {
  try {
    const { title, description, category, discount, startDate, endDate, targetAudience, color } = req.body;
    
    // Step 1: Validate required fields
    if (!title || !description || !category || !startDate || !endDate) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }
    
    // Step 2: Validate date range
    if (new Date(endDate) <= new Date(startDate)) {
      res.status(400);
      throw new Error('End date must be after start date');
    }
    
    // Step 3: Create event
    const event = await Event.create({
      title,
      description,
      category,
      discount: discount || '',
      startDate,
      endDate,
      targetAudience: targetAudience || 'all',
      color: color || '#4F46E5',
      createdBy: req.user._id,
      isActive: true,
    });
    
    // Step 4: Populate created event
    const populatedEvent = await Event.findById(event._id).populate('createdBy', 'username email');
    
    // Step 5: Send notifications to target users
    await notifyUsersAboutEvent(event);
    
    console.log('Event created successfully:', event._id);
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: populatedEvent,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: error.message || 'Failed to create event' });
  }
});

// @desc    Update event
// @route   PUT /api/admin/events/:id
// @access  Private/Admin
export const updateEvent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, discount, startDate, endDate, targetAudience, isActive, color } = req.body;
    
    // Step 1: Find event
    const event = await Event.findById(id);
    
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }
    
    // Step 2: Validate date range if dates are being updated
    if (startDate && endDate) {
      if (new Date(endDate) <= new Date(startDate)) {
        res.status(400);
        throw new Error('End date must be after start date');
      }
    }
    
    // Step 3: Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (discount !== undefined) event.discount = discount;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (targetAudience) event.targetAudience = targetAudience;
    if (isActive !== undefined) event.isActive = isActive;
    if (color) event.color = color;
    
    // Step 4: Save and populate
    await event.save();
    const populatedEvent = await Event.findById(event._id).populate('createdBy', 'username email');
    
    console.log('Event updated successfully:', event._id);
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: populatedEvent,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: error.message || 'Failed to update event' });
  }
});

// @desc    Delete event
// @route   DELETE /api/admin/events/:id
// @access  Private/Admin
export const deleteEvent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Step 1: Find and delete event
    const event = await Event.findById(id);
    
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }
    
    // Step 2: Delete the event
    await Event.findByIdAndDelete(id);
    
    console.log('Event deleted successfully:', id);
    
    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: error.message || 'Failed to delete event' });
  }
});

// Helper function to send notifications about new events
const notifyUsersAboutEvent = async (event) => {
  try {
    // Determine which users to notify based on targetAudience
    let query = {};
    if (event.targetAudience === 'seeker') {
      query.role = 'seeker';
    } else if (event.targetAudience === 'provider') {
      query.role = 'provider';
    }
    // For 'all', query remains empty (all users)
    
    const users = await User.find(query).select('_id');
    
    // Create notifications in bulk
    const notifications = users.map(user => ({
      recipient: user._id,
      type: 'event_published',
      title: `New Event: ${event.title}`,
      message: event.description.substring(0, 100) + (event.description.length > 100 ? '...' : ''),
      link: `/events`,
    }));
    
    // Use the notification controller's helper if available, or direct insert
    if (notifications.length > 0) {
      const Notification = (await import('../models/Notification.js')).default;
      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} notifications for event: ${event.title}`);
    }
  } catch (error) {
    console.error('Error creating event notifications:', error);
    // Don't throw - event creation should succeed even if notifications fail
  }
};
