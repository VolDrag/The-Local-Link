// User model schema
// Teammate 1: Define user schema with authentication fields
//Debashish
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const portfolioItemSchema = new mongoose.Schema(
    {
        imageUrl: { type: String },
        description: { type: String },
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
    email: { 
        type: String, 
        required: true, 
        unique: true},
    password: { 
        type: String, 
        required: true },
    username: { 
        type: String, 
        required: true,
        trim: true },
    firstName: {
        type: String, 
        trim: true },
    lastName: { 
        type: String, 
        trim: true },
    phone: { 
        type: String, 
        trim: true },
    location: { 
        type: String, 
        trim: true },
    profilePictureUrl: { 
        type: String, 
        trim: true },
    role: { 
        type: String, 
        enum: ['seeker', 'provider', 'admin'], 
        default: 'seeker' },
    businessName: { 
        type: String, 
        trim: true }, // provider-only
    isVerified: { 
        type: Boolean, 
        default: false }, // provider-only
    availabilityStatus: { 
        type: String, 
        enum: ['online', 'offline'], 
        default: 'offline' }, // provider-only
    portfolio: { 
        type: [portfolioItemSchema], 
        default: [] }, // provider-only
    favoriteProviders: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' }], // seeker-only
    adminLevel: { 
        type: String, 
        enum: ['super_admin', 'moderator'] }, // admin-only
    },

    {timestamps: true}
);

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

const User = mongoose.model("User", userSchema);

export default User;