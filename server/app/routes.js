const mongoose = require("mongoose");

module.exports = function (app, passport, db, jwt) {
	const JWT_SECRET =
		process.env.JWT_SECRET || "your-secret-key-change-in-production";

	// Demo mode - using a default demo user
	const DEMO_USER_ID = "6750000000000000000demo"; // Fixed demo user ID

	// Optional authentication - falls back to demo user
	const optionalAuth = async (req, res, next) => {
		const authHeader = req.headers["authorization"];
		const token = authHeader && authHeader.split(" ")[1];

		if (!token) {
			// No token provided - use demo user
			req.user = { _id: DEMO_USER_ID, email: "demo@bookit.app" };
			return next();
		}

		// Token provided - verify it
		jwt.verify(token, JWT_SECRET, (err, user) => {
			if (err) {
				// Invalid token - fall back to demo user
				req.user = { _id: DEMO_USER_ID, email: "demo@bookit.app" };
			} else {
				req.user = user;
			}
			next();
		});
	};

	// =============================================================================
	// API ROUTES ==================================================================
	// =============================================================================

	// AUTH ROUTES
	app.post("/api/auth/signup", (req, res, next) => {
		passport.authenticate("local-signup", (err, user, info) => {
			if (err) return res.status(500).json({ message: err.message });
			if (!user)
				return res
					.status(400)
					.json({ message: (info && info.message) || "Signup failed" });

			const token = jwt.sign(
				{ _id: user._id, email: user.local.email },
				JWT_SECRET,
				{ expiresIn: "7d" }
			);
			res.json({
				token,
				user: {
					_id: user._id,
					local: user.local,
					genres: user.genres,
					favGenres: user.favGenres,
				},
			});
		})(req, res, next);
	});

	app.post("/api/auth/login", (req, res, next) => {
		passport.authenticate("local-login", (err, user, info) => {
			if (err) return res.status(500).json({ message: err.message });
			if (!user)
				return res
					.status(401)
					.json({ message: (info && info.message) || "Login failed" });

			const token = jwt.sign(
				{ _id: user._id, email: user.local.email },
				JWT_SECRET,
				{ expiresIn: "7d" }
			);
			res.json({
				token,
				user: {
					_id: user._id,
					local: user.local,
					genres: user.genres,
					favGenres: user.favGenres,
					genreCount: user.genreCount,
				},
			});
		})(req, res, next);
	});

	// USER ROUTES
	app.get("/api/user/profile", optionalAuth, async (req, res) => {
		try {
			// Ensure demo user exists
			let user = await db.collection("users").findOne({ _id: req.user._id });

			// If demo user doesn't exist, create default demo user data
			if (!user && req.user._id === DEMO_USER_ID) {
				user = {
					_id: DEMO_USER_ID,
					local: {
						email: "demo@bookit.app",
						firstName: "Demo",
						lastName: "User",
					},
					genres: {
						romance: true,
						mystery: true,
						fantasy: true,
						scienceFiction: false,
						thriller: false,
						juvenile: false,
						nonFiction: false,
						fiction: false,
						selfhelp: false,
					},
					favGenres: ["romance", "mystery", "fantasy"],
					genreCount: {
						romance: 0,
						mystery: 0,
						fantasy: 0,
						scienceFiction: 0,
						thriller: 0,
						juvenile: 0,
						nonFiction: 0,
						fiction: 0,
						selfhelp: 0,
					},
					favoriteBooks: [],
				};
			}

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			res.json({
				_id: user._id,
				local: user.local,
				genres: user.genres,
				favGenres: user.favGenres,
				genreCount: user.genreCount,
			});
		} catch (err) {
			res.status(500).json({ message: err.message });
		}
	});

	app.put("/api/user/interests", optionalAuth, async (req, res) => {
		try {
			// Remove duplicates from favGenres array
			const uniqueFavGenres = [...new Set(req.body.favGenres)];

			// For demo user, just return success without saving
			if (req.user._id === DEMO_USER_ID) {
				return res.json({
					message: "Interests updated successfully (demo mode)",
				});
			}

			await db.collection("users").findOneAndUpdate(
				{ _id: new mongoose.Types.ObjectId(req.user._id) },
				{
					$set: {
						genres: req.body.genres,
						favGenres: uniqueFavGenres,
					},
				},
				{
					upsert: false,
					new: true,
				}
			);
			res.json({ message: "Interests updated successfully" });
		} catch (err) {
			res.status(500).json({ message: err.message });
		}
	});

	app.put("/api/user/genre-count", optionalAuth, async (req, res) => {
		try {
			const genreTitle = req.body.genreTitle;
			const genreCountSearch =
				"genreCount." +
				genreTitle.toLowerCase().replace(/-/g, "").replace(/\s+/g, "");

			// For demo user, just return success without saving
			if (req.user._id === DEMO_USER_ID) {
				return res.json({ message: "Genre count updated (demo mode)" });
			}

			await db.collection("users").findOneAndUpdate(
				{ _id: new mongoose.Types.ObjectId(req.user._id) },
				{
					$inc: {
						[genreCountSearch]: 1,
					},
				},
				{
					sort: { _id: -1 },
					upsert: true,
				}
			);
			res.json({ message: "Genre count updated" });
		} catch (err) {
			res.status(500).json({ message: err.message });
		}
	});

	// FAVORITE BOOKS ROUTES
	app.post("/api/user/favorites", optionalAuth, async (req, res) => {
		try {
			const { isbn, title, authors, imageLink } = req.body;

			// For demo user, just return success without saving
			if (req.user._id === DEMO_USER_ID) {
				return res.json({ message: "Book added to favorites (demo mode)" });
			}

			// Check if book is already in favorites
			const user = await db
				.collection("users")
				.findOne({ _id: new mongoose.Types.ObjectId(req.user._id) });

			const alreadyFavorited = user.favoriteBooks?.some(
				(book) => book.isbn === isbn
			);

			if (alreadyFavorited) {
				return res.status(400).json({ message: "Book already in favorites" });
			}

			await db.collection("users").findOneAndUpdate(
				{ _id: new mongoose.Types.ObjectId(req.user._id) },
				{
					$push: {
						favoriteBooks: {
							isbn,
							title,
							authors,
							imageLink,
							addedAt: new Date(),
						},
					},
				}
			);

			res.json({ message: "Book added to favorites" });
		} catch (err) {
			res.status(500).json({ message: err.message });
		}
	});

	app.delete("/api/user/favorites/:isbn", optionalAuth, async (req, res) => {
		try {
			// For demo user, just return success without saving
			if (req.user._id === DEMO_USER_ID) {
				return res.json({ message: "Book removed from favorites (demo mode)" });
			}

			await db.collection("users").findOneAndUpdate(
				{ _id: new mongoose.Types.ObjectId(req.user._id) },
				{
					$pull: {
						favoriteBooks: { isbn: req.params.isbn },
					},
				}
			);

			res.json({ message: "Book removed from favorites" });
		} catch (err) {
			res.status(500).json({ message: err.message });
		}
	});

	app.get("/api/user/favorites", optionalAuth, async (req, res) => {
		try {
			// For demo user, return empty array
			if (req.user._id === DEMO_USER_ID) {
				return res.json({ favoriteBooks: [] });
			}

			const user = await db
				.collection("users")
				.findOne({ _id: new mongoose.Types.ObjectId(req.user._id) });

			res.json({ favoriteBooks: user.favoriteBooks || [] });
		} catch (err) {
			res.status(500).json({ message: err.message });
		}
	});

	// =============================================================================
	// LEGACY ROUTES (for backwards compatibility if needed) ======================
	// =============================================================================

	app.get("/", function (req, res) {
		res.send("API is running. Use React app on port 3000");
	});

	// LOGOUT (for session-based, if still needed)
	app.get("/logout", function (req, res, next) {
		req.logout(function (err) {
			if (err) {
				return next(err);
			}
			res.json({ message: "Logged out successfully" });
		});
	});
};
