const LocalStrategy = require("passport-local").Strategy;
const User = require("../app/models/user");

module.exports = function (passport) {
	// Serialize user for session
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	// Deserialize user from session
	passport.deserializeUser(async (id, done) => {
		try {
			const user = await User.findById(id);
			done(null, user);
		} catch (err) {
			done(err, null);
		}
	});

	// LOCAL SIGNUP ============================================================
	passport.use(
		"local-signup",
		new LocalStrategy(
			{
				usernameField: "email",
				passwordField: "password",
				passReqToCallback: true,
			},
			async (req, email, password, done) => {
				try {
					// Check if user already exists
					const existingUser = await User.findOne({ "local.email": email });

					if (existingUser) {
						return done(null, false, {
							message: "That email is already taken.",
						});
					}

					// Create new user
					const newUser = new User();
					newUser.local.email = email;
					newUser.local.password = newUser.generateHash(password);
					newUser.local.firstName = req.body.firstName;
					newUser.local.lastName = req.body.lastName;
					newUser.genres = {
						romance: false,
						mystery: false,
						fantasy: false,
						scienceFiction: false,
						thriller: false,
						juvenile: false,
						nonFiction: false,
						fiction: false,
						selfhelp: false,
					};
					newUser.genreCount = {
						romance: 0,
						mystery: 0,
						fantasy: 0,
						scienceFiction: 0,
						thriller: 0,
						juvenile: 0,
						nonFiction: 0,
						fiction: 0,
						selfhelp: 0,
					};

					await newUser.save();
					return done(null, newUser);
				} catch (err) {
					return done(err);
				}
			}
		)
	);

	// LOCAL LOGIN =============================================================
	passport.use(
		"local-login",
		new LocalStrategy(
			{
				usernameField: "email",
				passwordField: "password",
				passReqToCallback: true,
			},
			async (req, email, password, done) => {
				try {
					// Find user by email
					const user = await User.findOne({ "local.email": email });

					// Check if user exists
					if (!user) {
						return done(null, false, { message: "No user found." });
					}

					// Validate password
					if (!user.validPassword(password)) {
						return done(null, false, { message: "Oops! Wrong password." });
					}

					// Success
					return done(null, user);
				} catch (err) {
					return done(err);
				}
			}
		)
	);
};
