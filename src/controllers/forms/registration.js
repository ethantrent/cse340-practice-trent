import { body, validationResult } from 'express-validator';
import { emailExists, saveUser, getAllUsers } from '../../models/forms/registration.js';

/**
 * Helper function to add registration-specific styles
 * @param {object} res - Express response object
 */
const addRegistrationSpecificStyles = (res) => {
    res.addStyle('registration');
};

/**
 * Comprehensive validation rules for user registration
 */
const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min: 7 })
        .withMessage('Name must be at least 7 characters long'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('confirmEmail')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid confirmation email')
        .normalizeEmail()
        .custom((value, { req }) => {
            if (value !== req.body.email) {
                throw new Error('Email addresses do not match');
            }
            return true;
        }),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)
        .withMessage('Password must contain at least one number and one symbol (!@#$%^&*)'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
];

/**
 * Display the registration form
 */
const showRegistrationForm = (req, res) => {
    addRegistrationSpecificStyles(res);
    res.render('forms/registration/form', {
        title: 'Register for an Account',
        errors: null,
        formData: { name: '', email: '', confirmEmail: '', password: '', confirmPassword: '' }
    });
};

/**
 * Process user registration submission
 */
const processRegistration = async (req, res) => {
    addRegistrationSpecificStyles(res);
    
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        // Validation failed - re-render form with errors
        return res.render('forms/registration/form', {
            title: 'Register for an Account',
            errors: errors.array(),
            formData: req.body
        });
    }
    
    const { name, email, password } = req.body;
    
    try {
        // Check if email already exists
        const exists = await emailExists(email);
        if (exists) {
            console.log(`Registration failed: Email ${email} already exists`);
            return res.render('forms/registration/form', {
                title: 'Register for an Account',
                errors: [{ msg: 'An account with this email address already exists' }],
                formData: req.body
            });
        }
        
        // Save the user
        const savedUser = await saveUser(name, email, password);
        
        if (!savedUser) {
            console.error('Failed to save user');
            return res.render('forms/registration/form', {
                title: 'Register for an Account',
                errors: [{ msg: 'An error occurred while creating your account. Please try again.' }],
                formData: req.body
            });
        }
        
        console.log(`User registered successfully: ${savedUser.name} (${savedUser.email})`);
        
        // Success - render form with success message
        res.render('forms/registration/form', {
            title: 'Register for an Account',
            errors: null,
            formData: { name: '', email: '', confirmEmail: '', password: '', confirmPassword: '' },
            success: 'Registration successful! Your account has been created.'
        });
    } catch (error) {
        console.error('Error processing registration:', error);
        res.status(500).render('forms/registration/form', {
            title: 'Register for an Account',
            errors: [{ msg: 'An unexpected error occurred. Please try again.' }],
            formData: req.body
        });
    }
};

/**
 * Display all registered users
 */
const showAllUsers = async (req, res) => {
    addRegistrationSpecificStyles(res);
    
    try {
        const users = await getAllUsers();
        res.render('forms/registration/list', {
            title: 'Registered Users',
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).render('errors/500', {
            title: 'Server Error',
            error: 'Unable to load users list'
        });
    }
};

export { showRegistrationForm, processRegistration, showAllUsers, registrationValidation };
