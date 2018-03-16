var express = require("express");
var router  = express.Router();
var Cafe = require("../models/cafe");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
var Comment= require("../models/comment");

var options = {
  provider: 'google',
  language:'ru',
  region:'ru',  
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyAC-_U5D5JD-qjUmAnwlEN6lHVP0u3a9yU', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};
 
var geocoder = NodeGeocoder(options);

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dnwibpmae', 
  api_key: '832357113265824', 
  api_secret: 'G_BxyJOdDj1a-SnQUfkjG8lVXZE'
});

//INDEX - показать все заведения

router.get("/", function(req, res){
    // Взять все заведения из БД
    Cafe.find({}, function(err, allCafes){
       if(err){
           console.log(err);
       } else {
          res.render("cafes/index",{cafes: allCafes, page: 'cafes'});
       }
    });
});

//CREATE - добавить новое заведение в БД
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
    //взять данные из формы
    var name = req.body.name;
    var cost = req.body.cost;
    var desc = req.body.description;
    var image = req.body.imageReference;
    var author = {
        id: req.user._id,
        username: req.user.username
                };
    
    geocoder.geocode(req.body.location, function (err, data) {
        
            if(err || data.status === "ZERO_RESULTS" || !data.length) {
                   req.flash("error", "Некорректный адрес - попытайтесь ввести другой адрес");
                   return res.redirect("back");
               }
            var lat = data[0].latitude
            var lng = data[0].longitude;
            var location = data[0].formattedAddress;
            if (image === ''){
                cloudinary.uploader.upload(req.file.path, function(result) {
                  console.log(result);
                    req.body.image = result.secure_url;
                    req.body.author = {
                        id: req.user._id,
                        username: req.user.username
                        }
                        
                    image = req.body.image;
                    author = req.body.author;
                    
                    var newCafe = {name: name, image: image, description: desc, cost: cost, author:author, location: location, lat: lat, lng: lng};
                    
                    Cafe.create(newCafe, function(err, newlyCreated){
                        if(err){
                            console.log(err);
                        } else {
                           
                            res.redirect("/cafes");
                        }
                    });
                
                });
            
            }
            else {
                 var newCafe = {name: name, image: image, description: desc, cost: cost, author:author, location: location, lat: lat, lng: lng};
              
                    Cafe.create(newCafe, function(err, newlyCreated){
                        if(err){
                            console.log(err);
                        } else {
                           
                            res.redirect("/cafes");
                        }
                    });
            }
                
           
    });
});

//NEW - показать форму для создания нового завдения
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("cafes/new"); 
});

// SHOW - показать больше информации об одном заведении
router.get("/:id", function(req, res){
    //найти заведение с данным ID
    Cafe.findById(req.params.id).populate("comments").exec(function(err, foundCafe){
        if(err){
            console.log(err);
        } else {
            if (foundCafe === null){
                req.flash("error", "Кафе удалено");
                res.redirect("back");
            }
            console.log(foundCafe)
            res.render("cafes/show", {cafe: foundCafe});
        }
    });
});

// EDIT - редактирование
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Cafe.findById(req.params.id, function(err, foundCafe){
        res.render("cafes/edit", {cafe: foundCafe});
    });
});

// UPDATE - обновление
router.put("/:id",middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
        if(err || data.status === "ZERO_RESULTS" || !data.length) {
               req.flash("error", "Некорректный адрес - попытайтесь ввести другой адрес");
               return res.redirect("back");
           }
        var lat = data[0].latitude
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var image = req.body.imageReference;
        
        if (image === ''){
                cloudinary.uploader.upload(req.file.path, function(result) {
                        console.log(result);
                        req.body.image = result.secure_url;
                        req.body.author = {
                            id: req.user._id,
                            username: req.user.username
                            }
                            
                        image = req.body.image;
        
                        var newData = {name: req.body.name, image: image, description: req.body.description, cost: req.body.cost, location: location, lat: lat, lng: lng};
                        
                        Cafe.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, cafe){
                            if(err){
                                req.flash("error", err.message);
                                res.redirect("back");
                            } else {
                                req.flash("success","Успешно обновлено!");
                                res.redirect("/cafes/" + cafe._id);
                            }
                        });
                });
        }
        else {
            var newData = {name: req.body.name, image: image, description: req.body.description, cost: req.body.cost, location: location, lat: lat, lng: lng};
                        
                        Cafe.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, cafe){
                            if(err){
                                req.flash("error", err.message);
                                res.redirect("back");
                            } else {
                                req.flash("success","Успешно обновлено!");
                                res.redirect("/cafes/" + cafe._id);
                            }
                        });
        }

    });
});
// DESTROY - удаление
router.delete("/:id",middleware.checkCampgroundOwnership, function(req, res){
   Cafe.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/cafes");
    //   } else {
    //       Comment.findByIdAndRemove().where('cafe.id').equals(req.params.id).populate('cafe').exec(function(err,comments) {
    //           if(err) {
    //                 req.flash("error", "Что-то пошло не так.");
    //                 return res.redirect("/");
    //             }
    //             else{
    //                 console.log(comments);
    //             }
    //       });
          
          req.flash("success", "Заведение удалено");
          res.redirect("/cafes");
      }
   });
});


module.exports = router;