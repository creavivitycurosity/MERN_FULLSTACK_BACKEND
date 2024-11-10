const http = require('http');
const url = require('url');
const { login } = require('./controllers/authController');
const { getAllUsers, addUser , updateUser , deleteUser , getUser  } = require('./controllers/userController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const db = require('./config/db'); // Import your database configuration
const bcrypt = require('bcryptjs'); // Import bcrypt for hashing passwords

const hardcodedUsername = 'revanth battula'; // Change this to your desired username
const hardcodedPassword = 'password1234'; // Change this to your desired password

// Function to setup hardcoded user
const setupHardcodedUser  = () => {
    const query = 'SELECT * FROM Tablet_login WHERE f_userName = ?';

    db.query(query, [hardcodedUsername], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            // User does not exist, insert new user
            const hashedPassword = bcrypt.hashSync(hardcodedPassword, 10); // Hash the password
            const insertQuery = 'INSERT INTO Tablet_login (f_userName, f_Pwd) VALUES (?, ?)';
            db.query(insertQuery, [hardcodedUsername, hashedPassword], (err) => {
                if (err) throw err;
                console.log('Hardcoded user created in the database.');
            });
        } else {
            console.log('Hardcoded user already exists in the database.');
        }
    });
};

// Call the setup function when the server starts
setupHardcodedUser ();

const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5000'); // Change this to your frontend URL
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204); // No Content
        return res.end();
    }

    const parsedUrl = url.parse(req.url, true);
    const pathName = parsedUrl.pathname;
    const method = req.method;

    // Serve static files from the uploads directory
    if (pathName.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, pathName); // Construct the file path
        fs.stat(filePath, (err, stats) => {
            if (err || !stats.isFile()) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'image/jpeg' }); // Adjust content type as needed
            fs.createReadStream(filePath).pipe(res); // Stream the file to the response
        });
        return; // Exit the request handler
    }

    // Handle API routes
    if (pathName === '/api/auth/login' && method === 'POST') {
        login(req, res);
    } else if (pathName === '/api/users' && method === 'GET') {
        getAllUsers(req, res);
    } else if (pathName === '/api/users' && method === 'POST') {
        addUser (req, res);
    } else if (pathName.startsWith('/api/users/') && method === 'GET') {
        const id = pathName.split('/')[3]; // Extract user ID from the URL
        getUser (id, res); // Call the getUser  function
    } else if (pathName.startsWith('/api/users/') && method === 'PUT') {
        const id = pathName.split('/')[3];
        updateUser (req, res, id);
    } else if (pathName.startsWith('/api/users/') && method === 'DELETE') {
        const id = pathName.split('/')[3];
        deleteUser (req, res, id);
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});