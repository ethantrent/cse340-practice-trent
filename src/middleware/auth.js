/**
 * Middleware to require authentication for protected routes
 * Redirects to login page if user is not authenticated
 * Sets res.locals.isLoggedIn = true for authenticated requests
 */
const requireLogin = (req, res, next) => {
    // Check if user is logged in via session
    if (req.session && req.session.user) {
        // User is authenticated - set UI state and continue
        res.locals.isLoggedIn = true;
        next();
    } else {
        // User is not authenticated - redirect to login
        res.redirect('/login');
    }
};

/**
 * Middleware factory to require specific role for route access
 * Returns middleware that checks if user has the required role
 * Uses flash messages to communicate authorization failures
 * 
 * @param {string} roleName - The role name required (e.g., 'admin', 'user')
 * @returns {Function} Express middleware function
 */
const requireRole = (roleName) => {
    return (req, res, next) => {
        // Check if user is logged in (req.session.user exists)
        if (!req.session || !req.session.user) {
            req.session.flash = {
                type: 'error',
                message: 'You must be logged in to access this page.'
            };
            return res.redirect('/login');
        }

        // Check if user's role_name matches the required roleName
        if (req.session.user.role_name !== roleName) {
            req.session.flash = {
                type: 'error',
                message: 'You do not have permission to access this page.'
            };
            return res.redirect('/');
        }

        // If user has required role, call next() to continue
        next();
    };
};

export { requireLogin, requireRole };
