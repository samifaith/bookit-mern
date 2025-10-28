const mongoose = require("mongoose");
const User = require("./app/models/user");
require("dotenv").config();

const configDB = require("./config/database");

async function createDemoUser() {
	try {
		await mongoose.connect(configDB.url);
		console.log("Connected to database");

		// Check if demo user already exists
		let demoUser = await User.findOne({ "local.email": "demo@bookit.app" });

		if (demoUser) {
			console.log("Demo user already exists, updating...");
			demoUser.local.firstName = "Demo";
			demoUser.local.lastName = "User";
			demoUser.genres = {
				Romance: true,
				Mystery: true,
				Fantasy: true,
				"Science-Fiction": false,
				Thriller: false,
				Juvenile: false,
				NonFiction: false,
				Fiction: false,
				"Self-Help": false,
			};
			demoUser.favGenres = ["Romance", "Mystery", "Fantasy"];
			demoUser.genreCount = {
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
			await demoUser.save();
		} else {
			console.log("Creating new demo user...");
			demoUser = new User();
			demoUser.local.email = "demo@bookit.app";
			demoUser.local.password = demoUser.generateHash("demo123");
			demoUser.local.firstName = "Demo";
			demoUser.local.lastName = "User";
			demoUser.genres = {
				Romance: true,
				Mystery: true,
				Fantasy: true,
				"Science-Fiction": false,
				Thriller: false,
				Juvenile: false,
				NonFiction: false,
				Fiction: false,
				"Self-Help": false,
			};
			demoUser.favGenres = ["Romance", "Mystery", "Fantasy"];
			demoUser.genreCount = {
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
			await demoUser.save();
		}

		console.log("Demo user created/updated successfully!");
		console.log("Email: demo@bookit.app");
		console.log("Password: demo123");
		console.log("User ID:", demoUser._id);

		await mongoose.connection.close();
		process.exit(0);
	} catch (err) {
		console.error("Error:", err);
		process.exit(1);
	}
}

createDemoUser();
