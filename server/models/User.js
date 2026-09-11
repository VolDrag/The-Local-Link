// User model schema
// Teammate 1: Define user schema with authentication fields
//Debashish
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Portfolio item sub-schema
//feature: Portfolio Management(25)
const portfolioItemSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, minlength: 5 },
        description: { type: String, required: true, trim: true, minlength: 10 },
        images: [{ type: String, required: true }], // Array of image URLs (max 3)
    },
    { _id: false }
);
//end feature: Portfolio Management(25)
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
        unique: true,
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
    
    emailVerified: { type: Boolean, default: false },
    emailVerificationCode: String,
    emailVerificationExpires: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,

    identityVerification: {
        status: {
            type: String,
            enum: ['unsubmitted', 'pending', 'approved', 'rejected'],
            default: 'unsubmitted',
        },
        documentType: { type: String, enum: ['nid', 'passport', 'trade_license', 'other'] },
        documentUrl: String,
        submittedAt: Date,
        reviewedAt: Date,
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rejectionReason: String,
    },
    payoutBalance: { type: Number, default: 0, min: 0 },
    bookingCredit: { type: Number, default: 0, min: 0 },
    noShowDates: [{ type: Date }],
    bookingSuspended: { type: Boolean, default: false },
    bookingSuspendedReason: String,
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },

    {timestamps: true}
);

userSchema.pre("save", async function(next) {
    if (!this.referralCode) {
        const stamp = Math.random().toString(36).slice(2, 6).toUpperCase();
        const prefix = (this.username || 'USER').slice(0, 4).toUpperCase();
        this.referralCode = `TLL${prefix}${stamp}`;
    }
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