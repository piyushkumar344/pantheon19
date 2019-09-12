function portalDown(req, res, next) {
    res.json({status: 500, message: "Registration portal is down."});
}

module.exports = portalDown;