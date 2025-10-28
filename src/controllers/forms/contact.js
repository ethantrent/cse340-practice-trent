import { body, validationResult } from 'express-validator';
import { saveContactForm, getAllContactForms } from '../../models/forms/contact.js';

/**
 * Helper function to add contact-specific styles
 * @param {object} res - Express response object
 */
const addContactSpecificStyles = (res) => {
    res.addStyle('contact');
};

/**
 * Validation rules for contact form
 */
const contactValidation = [
    body('subject')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Subject must be at least 3 characters long')
        .notEmpty()
        .withMessage('Subject is required'),
    body('message')
        .trim()
        .notEmpty()
        .withMessage('Message is required')
];

/**
 * Show the contact form
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const showContactForm = (req, res) => {
    addContactSpecificStyles(res);
    res.render('forms/contact/form', {
        title: 'Contact Us',
        errors: null,
        formData: { subject: '', message: '' }
    });
};

/**
 * Process the contact form submission
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const processContactForm = async (req, res) => {
    addContactSpecificStyles(res);
    
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        // Validation failed - re-render form with errors
        return res.render('forms/contact/form', {
            title: 'Contact Us',
            errors: errors.array(),
            formData: req.body
        });
    }
    
    try {
        // Save to database
        await saveContactForm(req.body.subject, req.body.message);
        
        // Success - render form with success message
        res.render('forms/contact/form', {
            title: 'Contact Us',
            errors: null,
            formData: { subject: '', message: '' },
            success: 'Thank you for contacting us! Your message has been received.'
        });
    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).render('forms/contact/form', {
            title: 'Contact Us',
            errors: [{ msg: 'An error occurred while saving your message. Please try again.' }],
            formData: req.body
        });
    }
};

/**
 * Show all contact form responses (admin view)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const showContactResponses = async (req, res) => {
    addContactSpecificStyles(res);
    
    try {
        const contactForms = await getAllContactForms();
        res.render('forms/contact/responses', {
            title: 'Contact Form Responses',
            contactForms
        });
    } catch (error) {
        console.error('Error fetching contact responses:', error);
        res.status(500).render('errors/500', {
            title: 'Server Error',
            error: 'Unable to load contact responses'
        });
    }
};

export { contactValidation, showContactForm, processContactForm, showContactResponses };
