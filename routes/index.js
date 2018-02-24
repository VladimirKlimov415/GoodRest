var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");



//корневой маршрут
router.get("/", function(req, res){
    res.render("landing");
});

// показать форму регистрации
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

//обработка регистрации
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/register");
        }
            passport.authenticate("local")(req, res, function(){
            req.flash("success", "Вы успешно зарегистрировались " + user.username);
            res.redirect("/cafes"); 
        });
    });
});

//показать форму входа
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

//обработка входа
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/cafes",
        failureRedirect: "/login",
        failureFlash: "Неверный логин или пароль",
        
    }), function(req, res){
        
});

//обработка выхода
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Вы успешно вышли!");
   res.redirect("/cafes");
});



module.exports = router;