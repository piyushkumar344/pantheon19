function closeRegistration(req, res, next) {
    return res.json({status: 400, message: "Registration portal is closed by Administrator, contact Info Cell (BIT Mesra)."});
}

module.exports = closeRegistration;