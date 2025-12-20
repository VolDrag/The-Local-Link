// User Controller
//Debashish
import Profile from '../models/Profile.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js'; 

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res) => {
  // TODO: Implement get user profile
  try {
    const userId = req.params.userId;
    const profile = await Profile.findOne({ user: userId })
    .populate('user', 'username email role')
    .populate('services', 'title description pricing');

    if (!profile) {
      return res.status(404).json({ 
        success: false,
        message: 'Profile not found',
        data: {
          image: "",
          name: "",
          age: "",
          phone: "",
          location: "",
          businessName: "",
          isVerified: false,
          availabilityStatus: "offline",
          services: []
        }      
      });
    }
    res.json({
      success: true,
      data: profile
    });
  }
  catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// @desc    Create or Update user profile
// @route   PUT /api/users/profile
// @access  Private
const createorupdateUserProfile = async (req, res) => {
  // TODO: Implement create or update user profile
  try {
    const {age, phone, location, name, userId, businessName, availabilityStatus} = req.body;    
    // Normalize path to use forward slashes for URLs (works on all platforms)
    const image = req.file ? req.file.path.replace(/\\/g, '/') : null;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false,
        message: 'You can only update your own profile'
      });
    }
    // Check if user is trying to set provider fields but is not a provider
    if (req.user.role !== 'provider' && (businessName || availabilityStatus)) {
      return res.status(403).json({ 
        success: false,
        message: 'Only providers can set business name and availability status'
      });
    }

    // Prevent manual manipulation of services array
    if (req.body.services !== undefined) {
      return res.status(403).json({ 
        success: false,
        message: 'Services are automatically managed when you create or delete services'
      });
    }

    // Check if provider is trying to set isVerified (only admins can)
    if (req.body.isVerified !== undefined) {
      return res.status(403).json({ 
        success: false,
        message: 'Only admins can verify providers'
      });
    }

    let profile = await Profile.findOne({user: userId});
    //this block when profile will be created for the first time
    if (!profile) {
      const profileData = {
        user: userId,
        age,
        phone,
        location,
        name,
        image: image || ""
      };
      
      // Add provider-specific fields if user is a provider
      if (req.user.role === 'provider') {
        if (businessName) profileData.businessName = businessName;
        if (availabilityStatus) profileData.availabilityStatus = availabilityStatus;
        // services array will be empty initially and populated when services are created
        profileData.services = [];
      }
        
      profile = await Profile.create(profileData);

      return res.json({ 
        success: true,
        message: "Profile Created Successfully",
        data: profile
      }); 
    }
    //this block when anyone want to update profile
    else {
      if (image) profile.image = image;
      if (age) profile.age = age;
      if (phone) profile.phone = phone;
      if (location) profile.location = location;
      if (name) profile.name = name;

      // Update provider-specific fields only if user is a provider
      if (req.user.role === 'provider') {
        if (businessName) profile.businessName = businessName;
        if (availabilityStatus) profile.availabilityStatus = availabilityStatus;
        // services are managed automatically through service creation/deletion
      }

      await profile.save();
  
      return res.json({ 
        success: true,
        message: "Profile Updated Successfully",
        data: profile
      }); 
    }
  }
  catch (error) {
    console.error('Create or update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating or updating profile',
      error: error.message
    });
  }
}


// @desc    Delete user account
// @route   DELETE /api/users/:userId
// @access  Private
const deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.userId;

    // Check if user is deleting their own account or is an admin
    if (req.user._id.toString() !== userIdToDelete && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'You can only delete your own account'
      });
    }

    // Import models needed for cascade deletion
    const User = (await import('../models/User.js')).default;
    const Service = (await import('../models/Service.js')).default;
    const Booking = (await import('../models/Booking.js')).default;
    const Review = (await import('../models/Review.js')).default;

    // Check if user exists
    const user = await User.findById(userIdToDelete);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found'
      });
    }

    // Cascade delete operations
    
    // 1. Delete user's profile
    await Profile.findOneAndDelete({ user: userIdToDelete });

    // 2. If user is a provider, delete all their services
    if (user.role === 'provider') {
      await Service.deleteMany({ provider: userIdToDelete });
    }

    // 3. Delete all bookings where user is seeker or provider
    await Booking.deleteMany({ 
      $or: [
        { seeker: userIdToDelete },
        { provider: userIdToDelete }
      ]
    });

    // 4. Delete all reviews by the user
    await Review.deleteMany({ user: userIdToDelete });

    // 5. Finally, delete the user account
    await User.findByIdAndDelete(userIdToDelete);

    res.json({
      success: true,
      message: 'User account and all associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user account',
      error: error.message
    });
  }
};

export { getUserProfile, createorupdateUserProfile, deleteUser };
