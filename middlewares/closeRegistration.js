function closeRegistration(req, res, next) {
    return res.json({ status: 400, message: "This Request has been closed." });
}

module.exports = closeRegistration;