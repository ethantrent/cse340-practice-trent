import db from '../db.js';

/**
 * Save a contact form submission to the database
 * @param {string} subject - The subject of the contact form
 * @param {string} message - The message content
 * @returns {Promise<object>} The inserted row
 */
const saveContactForm = async (subject, message) => {
    try {
        const query = `
            INSERT INTO contact_form (subject, message)
            VALUES ($1, $2)
            RETURNING *
        `;
        const values = [subject, message];
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error saving contact form:', error);
        throw error;
    }
};

/**
 * Get all contact form submissions from the database
 * @returns {Promise<Array>} Array of contact form submissions
 */
const getAllContactForms = async () => {
    try {
        const query = `
            SELECT id, subject, message, submitted
            FROM contact_form
            ORDER BY submitted DESC
        `;
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching contact forms:', error);
        throw error;
    }
};

export { saveContactForm, getAllContactForms };
