// Anupam - Booking Controller
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import { checkAndUpdateVerification } from '../utils/verificationHelper.js'; //Debashish
import { createNotification } from './notificationController.js';


export const createBooking = async (req, res) => {
  try {
    const { serviceId, scheduledDate, userNotes } = req.body;

    const service = await Service.findById(serviceId).populate('provider', 'name');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const booking = await Booking.create({
      seeker: req.user._id,
      service: serviceId,
      provider: service.provider._id,
      scheduledTime: scheduledDate,
      userNotes,
      status: 'pending' 
    });
    
    // Check seeker verification
    await checkAndUpdateVerification(req.user._id); //Debashish
    
    // Create notification for provider -Anupam
    await createNotification({
      recipient: service.provider._id,
      sender: req.user._id,
      type: 'booking_created',
      title: 'New Booking Request',
      message: `${req.user.name} has requested a booking for "${service.title}"`,
      relatedBooking: booking._id,
      relatedService: serviceId,
      link: `/bookings/${booking._id}`
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ seeker: req.user._id })
      .populate('service', 'title category pricing')
      .populate('provider', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user._id })
      .populate('service', 'title category pricing')
      .populate('seeker', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'title description category pricing')
      .populate('seeker', 'name email phone')
      .populate('provider', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      booking.seeker._id.toString() !== req.user._id.toString() &&
      booking.provider._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateBookingStatus = async (req, res) => {
  console.log('📝 updateBookingStatus called with:', {
    bookingId: req.params.id,
    status: req.body.status,
    userId: req.user._id
  });
  
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id || req.params.bookingId)
      .populate('service', 'title')
      .populate('seeker', 'name')
      .populate('provider', 'name');

    console.log('📦 Booking found:', {
      id: booking?._id,
      status: booking?.status,
      seeker: booking?.seeker?.name,
      provider: booking?.provider?.name,
      service: booking?.service?.title
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.provider._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Update status
    booking.status = status;
    // Set completedAt if status is completed
    if (status === 'completed') {
      booking.completedAt = Date.now();
    }
    await booking.save();

    console.log('💾 Booking saved with new status:', status);

    // Create notification for seeker based on status change
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType = '';

    switch (status) {
      case 'confirmed':
        notificationType = 'booking_confirmed';
        notificationTitle = 'Booking Confirmed';
        notificationMessage = `Your booking for "${booking.service.title}" has been confirmed by ${booking.provider.name}`;
        break;
      case 'completed':
        notificationType = 'booking_completed';
        notificationTitle = 'Booking Completed';
        notificationMessage = `Your booking for "${booking.service.title}" has been completed. Please leave a review!`;
        await checkAndUpdateVerification(booking.provider._id);
        break;
      case 'cancelled':
        notificationType = 'booking_cancelled';
        notificationTitle = 'Booking Cancelled';
        notificationMessage = `Your booking for "${booking.service.title}" has been cancelled by the provider`;
        break;
    }

    if (notificationType) {
      console.log('🔔 Creating notification for seeker:', {
        recipient: booking.seeker._id,
        type: notificationType,
        title: notificationTitle
      });
      
      const notification = await createNotification({
        recipient: booking.seeker._id,
        sender: req.user._id,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        relatedBooking: booking._id,
        relatedService: booking.service._id,
        link: `/bookings/${booking._id}`
      });
      
      console.log('✅ Notification created:', notification);
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('❌ Error in updateBookingStatus:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};



// Get booking history with filters - Feature 19 (Anupam)
export const getBookingHistory = async (req, res) => {
  try {
    const { status, startDate, endDate, serviceId } = req.query;
    
    // Build filter query
    const filter = { seeker: req.user._id };
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.scheduledTime = {};
      if (startDate) filter.scheduledTime.$gte = new Date(startDate);
      if (endDate) filter.scheduledTime.$lte = new Date(endDate);
    }
    
    if (serviceId) {
      filter.service = serviceId;
    }

    const bookings = await Booking.find(filter)
      .populate('service', 'title category pricing images')
      .populate('provider', 'name email phone')
      .sort({ scheduledTime: -1 });

    // Calculate statistics
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length
    };

    res.status(200).json({ bookings, stats });
  } catch (error) {
    console.error('Error fetching booking history:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get provider booking history with filters - Feature 19 (Anupam)
export const getProviderBookingHistory = async (req, res) => {
  try {
    const { status, startDate, endDate, serviceId } = req.query;
    
    // Build filter query
    const filter = { provider: req.user._id };
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.scheduledTime = {};
      if (startDate) filter.scheduledTime.$gte = new Date(startDate);
      if (endDate) filter.scheduledTime.$lte = new Date(endDate);
    }
    
    if (serviceId) {
      filter.service = serviceId;
    }

    const bookings = await Booking.find(filter)
      .populate('service', 'title category pricing images')
      .populate('seeker', 'name email phone')
      .sort({ scheduledTime: -1 });

    // Calculate statistics
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.service?.pricing?.amount || 0), 0)
    };

    res.status(200).json({ bookings, stats });
  } catch (error) {
    console.error('Error fetching provider booking history:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};