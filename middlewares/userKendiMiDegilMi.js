module.exports = (req, res, next) => {
    if (req.user) {
        if (req.user._id == req.params.userid) {
            return res.redirect("/dashboard");
        } else {
            next();
        }
    } else {
        next();
    }
};
