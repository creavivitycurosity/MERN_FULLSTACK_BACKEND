// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.login = (req, res) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
        const { username, password } = JSON.parse(body);
        const query = 'SELECT * FROM Tablet_login WHERE f_userName = ?';
        
        db.query(query, [username], (err, results) => {
            if (err) throw err;
            if (results.length === 0) {
                res.statusCode = 401;
                return res.end(JSON.stringify({ success: false, message: 'Invalid login' }));
            }

            const user = results[0];
            const passwordIsValid = bcrypt.compareSync(password, user.f_Pwd);
            if (!passwordIsValid) {
                res.statusCode = 401;
                return res.end(JSON.stringify({ success: false, message: 'Invalid login' }));
            }

            const token = jwt.sign({ id: user.f_sno, username: user.f_userName }, 'secretkey', { expiresIn: '1h' });
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, token }));
        });
    });
};
