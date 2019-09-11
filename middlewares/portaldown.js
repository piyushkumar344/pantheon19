function portalDown(req, res, next) {
    res.json({status: 500, message: "Sorry, Registration portal is down."});
}

module.exports = portalDown;