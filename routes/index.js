var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Cafe = require("../models/cafe");
var Comment = require("../models/comment");
var middleware = require("../middleware");

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

//личный кабинет
router.get("/users/:id", middleware.isLoggedIn, function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
    Cafe.find().where('author.id').equals(foundUser._id).exec(function(err, cafes) {
      if(err) {
        req.flash("error", "Something went wrong.");
        return res.redirect("/");
      }
      Comment.find().where('author.id').equals(foundUser._id).populate({path:'name',model:'Cafe'}).exec(function(err, comments){
         if(err) {
            req.flash("error", "Something went wrong.");
            return res.redirect("/");
        }
        
        console.log(comments);
       
        res.render("users/show", {user: foundUser, cafes: cafes, comments:comments,page:'profile'});
      })
      
    })
  });
});

module.exports = router;