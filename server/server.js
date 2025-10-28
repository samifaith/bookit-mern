// server.js

// set up ======================================================================
// get all the tools we need
require("dotenv").config();
var express = require("express");
var app = express();
var port = process.env.PORT || 7070;
const MongoClient = require("mongodb").MongoClient;
var mongoose = require("mongoose");
var passport = require("passport");
var flash = require("connect-flash");
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
const ObjectId = require("mongodb").ObjectID;
const multer = require("multer");
const cors = require("cors");
const jwt = require("jsonwebtoken");
var configDB = require("./config/database.js");
var db;

// configuration ===============================================================
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set("useFindAndModify", false);

// CORS configuration
app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	})
);

mongoose
	.connect(configDB.url)
	.then((database) => {
		db = database.connection.db;
		console.log("Connected to database!");
		require("./app/routes.js")(app, passport, db, multer, ObjectId, jwt);
		// launch ======================================================================
		app.listen(port);
		console.log("The magic happens on port " + port);
	})
	.catch((err) => {
		console.log("Database connection error:", err);
	});

require("./config/passport")(passport); // pass passport for configuration

// set up our express application
app.use(morgan("dev")); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

// required for passport
app.use(
	session({
		secret: process.env.SESSION_SECRET || "bookit", // session secret
		resave: true,
		saveUninitialized: true,
	})
);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
//require('./app/routes.js')(app, passport, db); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
// Moved to mongoose.connect().then() block above
// app.listen(port);
// console.log('The magic happens on port ' + port);
