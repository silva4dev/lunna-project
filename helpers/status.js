const status = (req, res, next) => {
    if(req.isAuthenticated() && req.user.status == 1) {
        return next();
    } else {
        req.flash("error_msg", "Você precisa ser um administrador");
        res.redirect("/");
    }
}

module.exports = status;