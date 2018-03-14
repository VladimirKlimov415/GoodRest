var express = require("express"),
    app = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    User        = require("./models/user"),
    Cafe  = require("./models/cafe"),
    Comment     = require("./models/comment"),
    moment = require("moment"),
    NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  language: 'ru',
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyAC-_U5D5JD-qjUmAnwlEN6lHVP0u3a9yU', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};
 
var geocoder = NodeGeocoder(options);
 



mongoose.connect("mongodb://localhost/goodrest");

//mongoose.connect(process.env.DATABASEURL);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash()); 
app.locals.moment = require('moment');
moment.locale('ru');

// конфигурация passport.js
app.use(require("express-session")({
    secret: "GoodRest is awesome service!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});


var indexRoutes = require("./routes/index"),
    cafesRoutes = require("./routes/cafes"),
    commentRoutes = require("./routes/comments");
    
app.use("/", indexRoutes);
app.use("/cafes", cafesRoutes);
app.use("/cafes/:id/comments", commentRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The Server Has Started!");
});

