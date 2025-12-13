// User Controller
import Profile from '../models/profile.js';
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
    const {age, phone, location, name, userId, businessName, availabilityStatus, services} = req.body;    
    const image = req.file ? req.file.path : null;
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
    if (req.user.role !== 'provider' && (businessName || availabilityStatus || services)) {
      return res.status(403).json({ 
        success: false,
        message: 'Only providers can set business name, availability status, and services'
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
        if (services) profileData.services = services;
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
        if (services) profile.services = services;
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
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = async (req, res) => {
  // TODO: Implement delete user
};

export { getUserProfile, createorupdateUserProfile, deleteUser };
