const express    = require('express'),
	  router     = express.Router({mergeParams: true}),
	  Campground = require('../models/campground'),
	  Comment    = require('../models/comment'),
	  middleware = require('../middleware');


router.get("/new", middleware.isLoggedIn, (req, res) => {
	Campground.findById(req.params.id).then(foundCampground => {
		res.render("comments/new",{campground: foundCampground});
	}).catch(err => {
		console.log("Could not retrive by id:", err.message);
	});
});

router.post("/", middleware.isLoggedIn, (req, res) =>{
	Campground.findById(req.params.id).then(foundCampground => {
		 Comment.create(req.body.comment).then(foundComment => {
			foundComment.author.id = req.user._id;
			foundComment.author.username = req.user.username;
			foundComment.save();
			foundCampground.comments.push(foundComment);
			foundCampground.save();
			req.flash("success", "Successfully added comment"); 
			res.redirect("/campgrounds/" + foundCampground._id);
		}).catch(err => {
			 req.flash("err", "Something went wrong");
			 console.log("Faild to retrive comment from the body:", err.message);
		});
	}).catch(err => {
		console.log("Faild to retrive campground by id:", err.message);
	});
});

router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
	Comment.findById(req.params.comment_id).then(foundComment => {
		res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
	}).catch(err => {
		res.redirect("back");
	});
});

router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment).then(updatedComment => {
		res.redirect("/campgrounds/" + req.params.id);
	}).catch(err => {
		res.redirect("back");
	});
});

router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id).then(() => {
		req.flash("success", "Comment successfully deleted");
		res.redirect("/campgrounds/" + req.params.id);
	}).catch(err => {
		res.redirect("back");
	});
});

module.exports = router;