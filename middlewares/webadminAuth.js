const config = require('../config');

const webadminAuth = (req, res, next) => {
    if (config.webadminPass !== req.headers['x-access-token']) {
        return res.json({ status: 401, message: "Not Authorized" });
    }
    next();
};

module.exports = webadminAuth;