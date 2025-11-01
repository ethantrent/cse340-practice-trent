import { validationResult } from 'express-validator';
import { findUserByEmail, verifyPassword } from '../../models/forms/login.js';

/**
 * Helper function to add login-specific styles
 * @param {object} res - Express response object
 */
const addLoginSpecificStyles = (res) => {
    res.addStyle('login');
};

/**
 * Display the login form
 */
const showLoginForm = (req, res) => {
    addLoginSpecificStyles(res);
    res.render('forms/login/form', {
        title: 'Login to Your Account',
        errors: null,
        formData: { email: '', password: '' }
    });
};

/**
 * Process login form submission
 */
const processLogin = async (req, res) => {
    addLoginSpecificStyles(res);
    
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        // Validation failed - re-render form with errors
        return res.render('forms/login/form', {
            title: 'Login to Your Account',
            errors: errors.array(),
            formData: req.body
        });
    }
    
    const { email, password } = req.body;
    
    try {
        // Find user by email
        const user = await findUserByEmail(email);
        
        if (!user) {
            console.log(`Login failed: User not found for email ${email}`);
            return res.render('forms/login/form', {
                title: 'Login to Your Account',
                errors: [{ msg: 'Invalid email or password' }],
                formData: req.body
            });
        }
        
        // Verify password
        const isPasswordValid = await verifyPassword(password, user.password);
        
        if (!isPasswordValid) {
            console.log(`Login failed: Invalid password for email ${email}`);
            return res.render('forms/login/form', {
                title: 'Login to Your Account',
                errors: [{ msg: 'Invalid email or password' }],
                formData: req.body
            });
        }
        
        // Remove password from user object before storing in session
        user.password = null;
        delete user.password;
        
        // Store user information in session
        req.session.user = user;
        
        console.log(`User logged in successfully: ${user.name} (${user.email})`);
        
        // Redirect to protected dashboard
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error processing login:', error);
        res.status(500).render('forms/login/form', {
            title: 'Login to Your Account',
            errors: [{ msg: 'An unexpected error occurred. Please try again.' }],
            formData: req.body
        });
    }
};

/**
 * Handle user logout
 * 
 * NOTE: connect.sid is the default session name since we did not name the session
 * when created it in our server.js file.
 */
const processLogout = (req, res) => {
    // First, check if there is a session object on the request
    if (!req.session) {
        // If no session exists, there's nothing to destroy,
        // so we just redirect the user back to the home page
        return res.redirect('/');
    }
    
    // Call destroy() to remove this session from the store (Postgres in our case)
    req.session.destroy((err) => {
        if (err) {
            // If something goes wrong while removing the session from the DB:
            console.error('Error destroying session:', err);
            /**
             * Clear the session cookie from the browser anyway, so the client
             * doesn't keep sending an invalid session ID.
             */
            res.clearCookie('connect.sid');
            /** 
             * Normally we would respond with a 500 error since logout didn't fully succeed with code
             * similar to: return res.status(500).send('Error logging out');
             * 
             * Since this is a practice site we will redirect to the home page anyways.
             */
            return res.redirect('/');
        }
        // If session destruction succeeded, clear the session cookie from the browser
        res.clearCookie('connect.sid');
        // Redirect the user to the home page
        res.redirect('/');
    });
};

/**
 * Display protected dashboard (requires login)
 */
const showDashboard = (req, res) => {
    const user = req.session.user;
    const sessionData = req.session;
    
    // Security check - ensure password is not in user object or session data
    if (user && user.password) {
        delete user.password;
    }
    
    // Create a copy of sessionData to avoid modifying the actual session
    const safeSessionData = JSON.parse(JSON.stringify(sessionData));
    if (safeSessionData.user && safeSessionData.user.password) {
        delete safeSessionData.user.password;
    }
    
    addLoginSpecificStyles(res);
    
    res.render('forms/login/dashboard', {
        title: 'Dashboard',
        user,
        sessionData: safeSessionData
    });
};

export { 
    showLoginForm, 
    processLogin, 
    processLogout, 
    showDashboard 
};
