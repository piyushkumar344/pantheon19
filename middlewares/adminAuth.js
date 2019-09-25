const config = require('../config');

const adminAuth = (req, res, next) => {
    if (config.adminPass === req.headers['x-access-token']) {
        next();
    }
    return res.json({ status: 401, message: "Not Authorized" });
};

module.exports = adminAuth;