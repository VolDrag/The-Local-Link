// Multer middleware for file uploads
// SHARED FILE: Used for ALL image uploads (profile pictures, portfolio images, etc.)
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist (SHARED - used by all features)
if (!fs.existsSync('uploads/')) {
    fs.mkdirSync('uploads/', { recursive: true });
}

// ============ FEATURE 25: Portfolio Showcase - START ============
// Create portfolio subdirectory for storing portfolio images
if (!fs.existsSync('uploads/portfolio/')) {
    fs.mkdirSync('uploads/portfolio/', { recursive: true });
}
// ============ FEATURE 25: Portfolio Showcase - END ============

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // ============ FEATURE 25: Portfolio Showcase - START ============
        // Check if this is for portfolio upload and route to correct folder
        if (req.baseUrl && req.baseUrl.includes('/portfolio')) {
            cb(null, 'uploads/portfolio/');  // Portfolio images go here
        // ============ FEATURE 25: Portfolio Showcase - END ============
        } else {
            cb(null, 'uploads/');  // All other images (profile pics, etc.)
        }
    },
    filename: (req, file, cb) => {
        // Create unique filename with timestamp and random string
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        // ============ FEATURE 25: Portfolio Showcase - Modified ============
        // Increased from 5MB to 10MB to support portfolio images
        fileSize: 10 * 1024 * 1024 // 10MB limit per file
        // ============ FEATURE 25: Portfolio Showcase - END ============
    }
});

export default upload;
