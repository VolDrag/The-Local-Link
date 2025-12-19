import mongoose from 'mongoose';
//Debashish
  const profileSchema = new mongoose.Schema({
    user: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: true
    },
    image: String,
    name: String,
    age: Number,
    phone: String,
    location: String,

    // Provider-specific fields
    businessName: {
      type: String,
      trim: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    availabilityStatus: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline'
    },
    services: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    }]
    
  }, { timestamps: true });

  export default mongoose.model('Profile', profileSchema);

