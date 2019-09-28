const config = require('../config');

const adminAuth = (req, res, next) => {
    if (config.adminPass !== req.headers['x-access-token']) {
        return res.json({ status: 401, message: "Not Authorized" });
    }
    next();
};

module.exports = adminAuth;