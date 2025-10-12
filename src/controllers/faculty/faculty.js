import { getFacultyById, getSortedFaculty } from '../../models/faculty/faculty.js';

// Route handler for the faculty list page
const facultyListPage = (req, res) => {
    // Get sort parameter from query string, default to 'name'
    const sortBy = req.query.sort || 'name';
    
    // Get sorted faculty array
    const facultyList = getSortedFaculty(sortBy);
    
    res.render('faculty/list', {
        title: 'Faculty Directory',
        facultyList: facultyList,
        currentSort: sortBy
    });
};

// Route handler for individual faculty detail pages
const facultyDetailPage = (req, res, next) => {
    const facultyId = req.params.facultyId;
    const faculty = getFacultyById(facultyId);
    
    // If faculty doesn't exist, create 404 error
    if (!faculty) {
        const err = new Error(`Faculty member ${facultyId} not found`);
        err.status = 404;
        return next(err);
    }
    
    res.render('faculty/detail', {
        title: `${faculty.name} - Faculty Profile`,
        faculty: faculty
    });
};

export { facultyListPage, facultyDetailPage };
