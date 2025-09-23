// Middleware that logs request information
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();  // Pass control to the next middleware
});

// Authentication middleware
app.use((req, res, next) => {
    if (!req.session.user) {
        // Stop here, redirect to login
        res.redirect('/login');
        return;
    }

    // User is authenticated, continue to the next middleware
    next();
});

// Routing
app.get('/', (req, res) => {
    res.send('Welcome to the Home Page!');
});

app.get('/about', (req, res) => {
    res.send('This is the About Page.');
});

app.post('/submit', (req, res) => {
    res.send('Form Submitted!');
});