//feature: Portfolio Management(25)--->this is the brain of portfolio management
// ============ FEATURE 25: Portfolio Showcase - ENTIRE FILE ============
// Portfolio Controller
// Handles provider portfolio image upload and management
// This entire file is for Feature 25: Provider Portfolio Showcase
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';

// @desc    Upload portfolio images (1-3 images per work with title & description)
// @route   POST /api/users/portfolio/upload
// @access  Private (Provider only)
// FUNCTION 1: Upload New Portfolio Work
const uploadPortfolioImages = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // STEP 1: Check if user is a provider (only providers can upload)
        if (req.user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Only providers can upload portfolio images'
            });
        }

        // STEP 2: Check if images were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No images uploaded'
            });
        }

        // STEP 3: Validate maximum 3 images per work
        if (req.files.length > 3) {
            // Clean up uploaded files (delete them if validation fails)
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
            return res.status(400).json({
                success: false,
                message: 'Maximum 3 images allowed per work'
            });
        }

        // STEP 4: Validate title (required, min 5 characters)
        const { title, description } = req.body;
        
        if (!title || title.trim().length < 5) {
            // Clean up uploaded files (delete them if validation fails)
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
            return res.status(400).json({
                success: false,
                message: 'Work title is required and must be at least 5 characters long'
            });
        }

        // STEP 5: Validate description (required, min 10 characters)
        if (!description || description.trim().length < 10) {
            // Clean up uploaded files (delete them if validation fails)
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
            return res.status(400).json({
                success: false,
                message: 'Work description is required and must be at least 10 characters long'
            });
        }

        // STEP 6: Find user in database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // STEP 7: Process uploaded image paths (convert backslashes to forward slashes)
        const imageUrls = req.files.map(file => file.path.replace(/\\/g, '/'));

        // STEP 8: Create new portfolio work object
        const newWork = {
            title: title.trim(),
            description: description.trim(),
            images: imageUrls
        };

        // STEP 9: Add to user's portfolio array and save to database
        user.portfolio.push(newWork);
        await user.save();

        // STEP 10: Send success response with updated portfolio
        res.json({
            success: true,
            message: 'Portfolio work added successfully',
            data: {
                portfolio: user.portfolio
            }
        });
    } catch (error) {
        // STEP 11: Error handling - catch any unexpected errors
        console.error('Upload portfolio images error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading portfolio images',
            error: error.message
        });
    }
};

// @desc    Get portfolio items (public access - anyone can view)
// @route   GET /api/users/portfolio/:userId
// @access  Public
// FUNCTION 2: View Provider's Portfolio
// @desc    Get portfolio items
// @route   GET /api/users/portfolio/:userId
// @access  Public
const getPortfolio = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const user = await User.findById(userId).select('portfolio username role');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== 'provider') {
            return res.status(400).json({
                success: false,
                message: 'This user is not a provider'
            });
        }

        res.json({
            success: true,
            data: {
                portfolio: user.portfolio,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Get portfolio error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching portfolio',
            error: error.message
        });
    }
};

// @desc    Update portfolio work (title and/or description only, not images)
// @route   PUT /api/users/portfolio/:itemIndex
// @access  Private (Provider only - can only edit own portfolio)
// FUNCTION 3: Edit Portfolio Work
// @desc    Update portfolio item description
// @route   PUT /api/users/portfolio/:itemIndex
// @access  Private (Provider only)
const updatePortfolioItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const itemIndex = parseInt(req.params.itemIndex);
        const { title, description } = req.body;

        // Check if user is a provider
        if (req.user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Only providers can update portfolio items'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Validate item index
        if (itemIndex < 0 || itemIndex >= user.portfolio.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid portfolio item index'
            });
        }

        // Update title and/or description
        if (title !== undefined) {
            if (title.trim().length < 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Title must be at least 5 characters long'
                });
            }
            user.portfolio[itemIndex].title = title.trim();
        }
        if (description !== undefined) {
            if (description.trim().length < 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Description must be at least 10 characters long'
                });
            }
            user.portfolio[itemIndex].description = description.trim();
        }
        await user.save();

        res.json({
            success: true,
            message: 'Portfolio item updated successfully',
            data: {
                portfolio: user.portfolio
            }
        });
    } catch (error) {
        console.error('Update portfolio item error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating portfolio item',
            error: error.message
        });
    }
};

// @desc    Delete portfolio work (removes all images of that work)// @desc    Delete portfolio work (removes all images of that work)
// @route   DELETE /api/users/portfolio/:itemIndex
// @access  Private (Provider only - can only delete own portfolio)
// FUNCTION 4: Delete Portfolio Work

// @desc    Delete portfolio item
// @route   DELETE /api/users/portfolio/:itemIndex
// @access  Private (Provider only)
const deletePortfolioItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const itemIndex = parseInt(req.params.itemIndex);

        // Check if user is a provider
        if (req.user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Only providers can delete portfolio items'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Validate item index
        if (itemIndex < 0 || itemIndex >= user.portfolio.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid portfolio item index'
            });
        }

        // Get the image paths before removing from array
        const images = user.portfolio[itemIndex].images || [];
        
        // Remove from portfolio array
        user.portfolio.splice(itemIndex, 1);
        await user.save();

        // Delete all physical files
        images.forEach(imageUrl => {
            if (imageUrl) {
                const imagePath = path.join(process.cwd(), imageUrl);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        });

        res.json({
            success: true,
            message: 'Portfolio item deleted successfully',
            data: {
                portfolio: user.portfolio
            }
        });
    } catch (error) {
        console.error('Delete portfolio item error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting portfolio item',
            error: error.message
        });
    }
};

// @desc    Delete all portfolio works (clears entire portfolio)
// @route   DELETE /api/users/portfolio
// @access  Private (Provider only - can only clear own portfolio)
// FUNCTION 5: Clear Entire Portfolio

// @desc    Delete all portfolio items
// @route   DELETE /api/users/portfolio
// @access  Private (Provider only)
const clearPortfolio = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if user is a provider
        if (req.user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Only providers can clear portfolio'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete all physical files
        user.portfolio.forEach(work => {
            if (work.images && Array.isArray(work.images)) {
                work.images.forEach(imageUrl => {
                    if (imageUrl) {
                        const imagePath = path.join(process.cwd(), imageUrl);
                        if (fs.existsSync(imagePath)) {
                            fs.unlinkSync(imagePath);
                        }
                    }
                });
            }
        });

        // Clear portfolio array
        user.portfolio = [];
        await user.save();

        res.json({
            success: true,
            message: 'Portfolio cleared successfully'
        });
    } catch (error) {
        console.error('Clear portfolio error:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing portfolio',
            error: error.message
        });
    }
};

// Export all portfolio management functions
export {
    uploadPortfolioImages,    // Upload new portfolio work (1-3 images + title + description)
    getPortfolio,             // Get provider's portfolio (public access)
    updatePortfolioItem,      // Edit work title/description
    deletePortfolioItem,      // Delete a single work
    clearPortfolio            // Delete all portfolio works
};
// ============ FEATURE 25: Portfolio Showcase - END OF FILE ============
