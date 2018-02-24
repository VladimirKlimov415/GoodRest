var Cafe = require("../models/cafe");
var Comment = require("../models/comment");


var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Cafe.findById(req.params.id, function(err, foundCafe){
           if(err){
               req.flash("error", "Заведение не найдено");
               res.redirect("back");
           }  else {
               // Заведение создал пользователь?
            if(foundCafe.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "У вас нет прав для того, чтобы это сделать");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "Вам нужно войти, чтобы сделать это");
        res.redirect("/login");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               res.redirect("back");
           }  else {
               // Комментарий создал пользователь?
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "У вас нет прав для того, чтобы это сделат");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "Вам нужно войти, чтобы сделать это");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Вам нужно войти, чтобы сделать это");
    res.redirect("/login");
}

module.exports = middlewareObj;