const express    = require('express'),
	  router     = express.Router(),
	  Campground = require('../models/campground'),
	  middleware = require('../middleware'),
      NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

router.get("/", (req, res) => {
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(middleware.escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({name: regex}).then(allCampgrounds => {
        	if(allCampgrounds.length < 1) {
            	noMatch = "No campgrounds match that query, please try again.";
            }
              res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
           }).catch(err => {
			console.log(err);
		});
    } else {
        // Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
           }
        });
    }
});


//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, (req, res) => {
  // get data from form and add to campgrounds array
   var name = req.body.name;
   var image = req.body.image;
   var desc = req.body.description;
   var price = req.body.cost;
   var author = {
       id: req.user._id,
       username: req.user.username
   };
   geocoder.geocode(req.body.location, (err, data) => {
     if (err || !data.length) {
       req.flash('error', 'Invalid address');
       return res.redirect('back');
     }
     var lat = data[0].latitude;
     var lng = data[0].longitude;
     var location = data[0].formattedAddress;
     var newCampground = {name: name, image: image, description: desc, cost: cost, author:author, location: location, lat: lat, lng: lng};
     // Create a new campground and save to DB
     Campground.create(newCampground).then(newlyCreated =>{
         console.log(newlyCreated);
         res.redirect("/campgrounds");
	 }).catch(err => {
  			console.log(err);
	 });
   });
});

router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

router.get("/:id", (req, res) => {
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
		if(err) {
			console.log(err);
		}else {
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id).then(foundCampground => {
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

router.put("/:id", middleware.checkCampgroundOwnership, (req, res) =>{
  geocoder.geocode(req.body.location, (err, data) => {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground).then(campground =>{
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }).catch(err => {
		    req.flash("error", err.message);
            res.redirect("back");
		});
    });
});
router.delete("/:id", (req, res) => {
	Campground.findByIdAndRemove(req.params.id).then(() => {
		res.redirect("/campgrounds");
	}).catch(err => {
		res.redirect("/campgrounds");
	});
});

module.exports = router;
