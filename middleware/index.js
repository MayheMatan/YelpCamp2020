var Campground = require("../models/campground");
var Comment = require("../models/comment");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
 if(req.isAuthenticated()){
        Campground.findById(req.params.id).then(foundCampground => {
            if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
			} else {
				req.flash("error", "You do not have permission to do that");
            	res.redirect("back");
			}
        }).catch(err => {
			req.flash("error", "Campground not found");
			res.redirect("back");
		});
    } else {
		req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Comment.findById(req.params.id).then(foundComment => {
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
			} else {
				req.flash("error", "You do not have permission to do that");
            	res.redirect("back");
			}
        }).catch(err => {
			req.flash("error", "Comment not found");
			res.redirect("back");
		});
    } else {
		req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = ((req, res, next) =>{
    if(req.isAuthenticated()){
        return next();
    } else {
		req.flash("error", "You need to be logged in to do that");
    	res.redirect("/login");
	}
});

middlewareObj.escapeRegex = (text => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
});

module.exports = middlewareObj;
