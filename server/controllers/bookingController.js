import Booking from '../models/Booking.js';
import Service from '../models/Service.js';

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const { serviceId, scheduledDate, userNotes } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      service: serviceId,
      provider: service.provider,
      scheduledDate,
      userNotes,
      status: 'pending' 
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Placeholders for other features
export const getMyBookings = async (req, res) => { res.status(200).json({ message: "My bookings" }); };
export const getProviderBookings = async (req, res) => { res.status(200).json({ message: "Provider bookings" }); };
export const getBookingById = async (req, res) => { res.status(200).json({ message: "Get booking" }); };
export const updateBookingStatus = async (req, res) => { res.status(200).json({ message: "Update status" }); };
export const cancelBooking = async (req, res) => { res.status(200).json({ message: "Cancel booking" }); };