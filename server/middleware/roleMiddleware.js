// Role-based authorization middleware
// Check if user has required role (admin/provider)

// Role-based access control middleware

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