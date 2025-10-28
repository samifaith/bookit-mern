// server.js

// Dependencies ================================================================
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const configDB = require("./config/database.js");

const app = express();
const port = process.env.PORT || 7070;

// Middleware Configuration ====================================================
app.use(morgan("dev")); // log requests to console
app.use(cookieParser()); // read cookies for auth
app.use(express.json()); // parse JSON bodies (replaces body-parser)
app.use(express.urlencoded({ extended: true })); // parse URL-encoded bodies

// CORS configuration
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true,
	})
);

// Session configuration (required for passport)
app.use(
	session({
		secret: process.env.SESSION_SECRET || "bookit",
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		},
	})
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
require("./config/passport")(passport);

// Database Connection =========================================================
mongoose
	.connect(configDB.url)
	.then(() => {
		console.log("Connected to database!");
		const db = mongoose.connection.db;

		// Load routes after DB connection
		require("./app/routes.js")(app, passport, db, jwt);

		// Start server
		app.listen(port, () => {
			console.log(`Server running on port ${port}`);
		});
	})
	.catch((err) => {
		console.error("Database connection error:", err);
		process.exit(1);
	});

// Graceful shutdown
process.on("SIGINT", async () => {
	await mongoose.connection.close();
	console.log("Database connection closed");
	process.exit(0);
});
