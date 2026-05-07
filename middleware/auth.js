// Authentication middleware
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// Role-based access control
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).render('error', { 
        error: 'Access denied. You do not have permission to access this page.',
        user: req.session.user 
      });
    }
    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
