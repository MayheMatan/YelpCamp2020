require('dotenv').config();
const express 		 = require('express'),
	  app 			 = express(),
	  bodyParser 	 = require('body-parser'),
      mongoose 		 = require('mongoose'),
	  passport		 = require('passport'),
	  localStrategy  = require('passport-local'),
	  methodOverride = require('method-override'),
	  flash			 = require('connect-flash'),
	  User			 = require('./models/user'),
	  Campground     = require('./models/campground'),
	  Comment		 = require('./models/comment'),
	  seedDB		 = require('./seeds');

const indexRoutes 	   = require('./routes/index'),
	  commentRoutes    = require('./routes/comments'),
	  campgroundRoutes = require('./routes/campgrounds');

mongoose.connect(process.env.DATABASEURL, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
}).then(() =>{
	console.log("Connected to DB!");
}).catch(err => {
	console.log("Something Went Wrong!", err.message);
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.set("view engine", "ejs");

//seeds the DB
//seedDB();

app.use(require('express-session')({
	secret: "Mayhem is the best black metal band in norway",
	resave: false,
    saveUninitialized: false
}));
app.locals.moment = require('moment');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

app.listen(process.env.PORT || 3000, () => {
	console.log("YelpCamp Server is Running!");
});
