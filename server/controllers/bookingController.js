// Anupam - Booking Controller
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import { checkAndUpdateVerification } from '../utils/verificationHelper.js'; //Debashish


export const createBooking = async (req, res) => {
  try {
    const { serviceId, scheduledDate, userNotes } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

        const booking = await Booking.create({
      seeker: req.user._id,      // Changed from 'user' to 'seeker'
      service: serviceId,
      provider: service.provider,
      scheduledTime: scheduledDate,  // Changed from 'scheduledDate' to 'scheduledTime'
      userNotes,
      status: 'pending' 
    });
    // Check seeker verification
    await checkAndUpdateVerification(req.user._id); //Debashish

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
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
      .populate('user', 'name email')
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
      .populate('user', 'name email phone')
      .populate('provider', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      booking.user._id.toString() !== req.user._id.toString() &&
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
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id || req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Update status
    booking.status = status;
    // Set completedAt if status is completed
    if (status === 'completed') {
      booking.completedAt = Date.now();
    }
    await booking.save();

    // After updating booking status to 'completed' (add in updateBookingStatus function)
    //Debashish
    if (status === 'completed') {
      await checkAndUpdateVerification(booking.provider); // Check provider verification
    } 

    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};