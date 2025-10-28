import { Router } from 'express';

// Import middleware
import { addDemoHeaders } from '../middleware/demo/headers.js';
import { requireLogin } from '../middleware/auth.js';

// Import controllers
import { catalogPage, courseDetailPage } from './catalog/catalog.js';
import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';
import { homePage, aboutPage, demoPage, testErrorPage } from './index.js';
import { 
    contactValidation, 
    showContactForm, 
    processContactForm, 
    showContactResponses 
} from './forms/contact.js';
import { 
    showRegistrationForm, 
    processRegistration, 
    showAllUsers, 
    registrationValidation 
} from './forms/registration.js';
import { 
    showLoginForm, 
    processLogin, 
    processLogout, 
    showDashboard, 
    loginValidation 
} from './forms/login.js';

// Create a new router instance
const router = Router();

// Home and basic pages
router.get('/', homePage);
router.get('/about', aboutPage);

// Course catalog routes
router.get('/catalog', catalogPage);
router.get('/catalog/:courseId', courseDetailPage);

// Faculty directory routes
router.get('/faculty', facultyListPage);
router.get('/faculty/:facultyId', facultyDetailPage);

// Contact form routes
router.get('/contact', showContactForm);
router.post('/contact', contactValidation, processContactForm);
router.get('/contact/responses', showContactResponses);

// User registration routes
router.get('/register', showRegistrationForm);
router.post('/register', registrationValidation, processRegistration);
router.get('/users', showAllUsers);

// Authentication routes
router.get('/login', showLoginForm);
router.post('/login', loginValidation, processLogin);
router.get('/logout', processLogout);

// Protected routes (require authentication)
router.get('/dashboard', requireLogin, showDashboard);

// Demo page with special middleware
router.get('/demo', addDemoHeaders, demoPage);

// Route to trigger a test error
router.get('/test-error', testErrorPage);

export default router;
