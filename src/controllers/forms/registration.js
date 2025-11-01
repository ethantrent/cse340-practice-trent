import { body, validationResult } from 'express-validator';
import { 
    emailExists, 
    saveUser, 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser 
} from '../../models/forms/registration.js';

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
 * Validation rules for account updates
 */
const updateAccountValidation = [
    body('name')
        .trim()
        .isLength({ min: 7 })
        .withMessage('Name must be at least 7 characters long'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
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

/**
 * Display the edit account form
 * Users can edit their own account, admins can edit any account
 */
const showEditAccountForm = async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;

    // Retrieve the target user from the database using getUserById
    const targetUser = await getUserById(targetUserId);

    // Check if the target user exists
    if (!targetUser) {
        req.session.flash = {
            type: 'error',
            message: 'User not found.'
        };
        return res.redirect('/users');
    }

    // Determine if current user can edit this account
    // Users can edit their own (currentUser.id === targetUserId)
    // Admins can edit anyone (currentUser.role_name === 'admin')
    const canEdit = currentUser.id === targetUserId || currentUser.role_name === 'admin';

    // If current user cannot edit, set flash message and redirect
    if (!canEdit) {
        req.session.flash = {
            type: 'error',
            message: 'You do not have permission to edit this account.'
        };
        return res.redirect('/users');
    }

    // Render the edit form, passing the target user data
    addRegistrationSpecificStyles(res);
    res.render('forms/registration/edit', {
        title: 'Edit Account',
        user: targetUser
    });
};

/**
 * Process account edit form submission
 */
const processEditAccount = async (req, res) => {
    const errors = validationResult(req);
    
    // Check for validation errors
    if (!errors.isEmpty()) {
        req.session.flash = {
            type: 'error',
            message: 'Please correct the errors in the form.'
        };
        return res.redirect(`/users/${req.params.id}/edit`);
    }

    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;
    const { name, email } = req.body;

    // Retrieve the target user to verify they exist
    const targetUser = await getUserById(targetUserId);
    
    if (!targetUser) {
        req.session.flash = {
            type: 'error',
            message: 'User not found.'
        };
        return res.redirect('/users');
    }

    // Check edit permissions (same as showEditAccountForm)
    const canEdit = currentUser.id === targetUserId || currentUser.role_name === 'admin';
    
    if (!canEdit) {
        req.session.flash = {
            type: 'error',
            message: 'You do not have permission to edit this account.'
        };
        return res.redirect('/users');
    }

    // Check if the new email already exists for a DIFFERENT user
    // It's okay if it matches the target user's current email
    if (email.toLowerCase() !== targetUser.email.toLowerCase()) {
        const emailTaken = await emailExists(email);
        if (emailTaken) {
            req.session.flash = {
                type: 'error',
                message: 'An account with this email address already exists.'
            };
            return res.redirect(`/users/${targetUserId}/edit`);
        }
    }

    // Update the user in the database using updateUser
    const updatedUser = await updateUser(targetUserId, name, email);
    
    if (!updatedUser) {
        req.session.flash = {
            type: 'error',
            message: 'Failed to update account. Please try again.'
        };
        return res.redirect(`/users/${targetUserId}/edit`);
    }

    // If the current user edited their own account, update their session
    if (currentUser.id === targetUserId) {
        req.session.user.name = name;
        req.session.user.email = email;
    }

    // Success! Set flash message and redirect
    req.session.flash = {
        type: 'success',
        message: 'Account updated successfully.'
    };
    res.redirect('/users');
};

/**
 * Delete a user account (admin only)
 */
const processDeleteAccount = async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;

    // Verify current user is an admin
    // Only admins should be able to delete accounts
    if (currentUser.role_name !== 'admin') {
        req.session.flash = {
            type: 'error',
            message: 'You do not have permission to delete accounts.'
        };
        return res.redirect('/users');
    }

    // Prevent admins from deleting their own account
    if (targetUserId === currentUser.id) {
        req.session.flash = {
            type: 'error',
            message: 'You cannot delete your own account.'
        };
        return res.redirect('/users');
    }

    // Delete the user using deleteUser function
    const deleted = await deleteUser(targetUserId);
    
    if (!deleted) {
        req.session.flash = {
            type: 'error',
            message: 'Failed to delete account. Please try again.'
        };
        return res.redirect('/users');
    }

    // Success! Set flash message and redirect
    req.session.flash = {
        type: 'success',
        message: 'Account deleted successfully.'
    };
    res.redirect('/users');
};

export { 
    showRegistrationForm, 
    processRegistration, 
    showAllUsers, 
    registrationValidation,
    updateAccountValidation,
    showEditAccountForm,
    processEditAccount,
    processDeleteAccount
};
