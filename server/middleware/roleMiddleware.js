// Role-based authorization middleware
// This checks if the user has the required role to access a route

// Flexible authorize middleware (supports multiple roles)
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Step 1: Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Step 2: Check if user role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `You don't have permission to access this` 
      });
    }

    // Step 3: User has required role, allow access
    next();
  };
};

// Specific role middlewares (from teammate's implementation)
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

export const providerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'provider') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Provider only.' });
  }
};

export const seekerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'seeker') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Seeker only.' });
  }
};
