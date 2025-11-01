import { body } from 'express-validator';

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

export { contactValidation };
