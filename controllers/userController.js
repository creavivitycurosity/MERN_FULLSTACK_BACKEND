// backend/controllers/userController.js
const db = require('../config/db');
const formidable = require('formidable');

// Get all users
exports.getAllUsers = (req, res) => {
    const query = 'SELECT * FROM t_Employee';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.statusCode = 200;
        res.end(JSON.stringify(results));
    });
};

// Add a new user
const fs = require('fs');
const path = require('path');

exports.addUser  = (req, res) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../uploads'); // Set the upload directory
    form.keepExtensions = true; // Keep file extensions

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Error parsing the form:', err); // Log the error
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
        }

        console.log('Fields:', fields); // Log the fields
        console.log('Files:', files); // Log the files

        const { f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course } = fields;
        const imageFile = files.image[0]; // Access the first element of the array

        // Validate required fields
        if (!f_Name || !f_Email || !f_Mobile) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, message: 'f_Name, f_Email, and f_Mobile are required.' }));
        }

        const checkEmailQuery = 'SELECT * FROM t_Employee WHERE f_Email = ?';
        db.query(checkEmailQuery, [f_Email], (err, result) => {
            if (err) {
                console.error(err); // Log the error for debugging
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
            }

            if (result.length > 0) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ success: false, message: 'Email already exists' }));
            }

            // Prepare the insert query
            const query = 'INSERT INTO t_Employee (f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course, f_Image) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const imagePath = imageFile ? path.join('uploads', imageFile.newFilename) : null; // Save the path

            console.log('Image Path:', imagePath); // Log the image path

            db.query(query, [f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course, imagePath], (err, result) => {
                if (err) {
                    console.error(err); // Log the error for debugging
                    res.statusCode = 500;
                    return res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
                }
                res.statusCode = 201;
                res.end(JSON.stringify({ success: true, message: 'User  added successfully' }));
            });
        });
    });
};


exports.getUser  = (id, res) => {
    const query = 'SELECT * FROM t_Employee WHERE f_Id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
        }
        if (result.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'User  not found' }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result[0])); // Return the user object
    });
};
exports.updateUser  = (req, res, id) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../uploads'); // Set the upload directory
    form.keepExtensions = true; // Keep file extensions

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Error parsing the form:', err); // Log the error
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
        }

        console.log('Fields:', fields); // Log the fields
        console.log('Files:', files); // Log the files

        const { f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course } = fields;
        const imageFile = files.image ? files.image[0] : null; // Access the first element of the array

        const query = 'UPDATE t_Employee SET f_Name = ?, f_Email = ?, f_Mobile = ?, f_Designation = ?, f_gender = ?, f_Course = ?' + (imageFile ? ', f_Image = ?' : '') + ' WHERE f_Id = ?';
        const params = [f_Name, f_Email, f_Mobile, f_Designation, f_gender, f_Course];

        if (imageFile) {
            const imagePath = path .join('uploads', imageFile.newFilename); // Save the path
            params.push(imagePath); // Add imagePath to params
        }

        params.push(id); // Add the user ID to the params

        db.query(query, params, (err, result) => {
            if (err) {
                console.error(err); // Log the error for debugging
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
            }
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: 'User  updated successfully' }));
        });
    });
};

// Delete a user
exports.deleteUser = (req, res, id) => {
    const query = 'DELETE FROM t_Employee WHERE f_Id = ?';
    db.query(query, [id], (err, result) => {
        if (err) throw err;
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, message: 'User deleted successfully' }));
    });
};
