// Migration script to add categories to existing favorited books
const mongoose = require("mongoose");
const axios = require("axios");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/bookit", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;

async function fetchBookCategories(isbn) {
	try {
		const response = await axios.get(
			`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
		);
		const book = response.data.items?.[0];
		return book?.volumeInfo?.categories || [];
	} catch (err) {
		console.error(`Error fetching categories for ISBN ${isbn}:`, err.message);
		return [];
	}
}

async function migrateFavorites() {
	try {
		console.log("🚀 Starting migration...");

		const users = await db.collection("users").find({}).toArray();

		for (const user of users) {
			if (!user.favoriteBooks || user.favoriteBooks.length === 0) {
				console.log(`⏭️  Skipping user ${user.email} - no favorites`);
				continue;
			}

			console.log(
				`\n👤 Processing user: ${user.email} (${user.favoriteBooks.length} favorites)`
			);

			let updatedCount = 0;
			const updatedFavorites = [];

			for (const book of user.favoriteBooks) {
				// If book already has categories, keep as is
				if (book.categories && book.categories.length > 0) {
					updatedFavorites.push(book);
					console.log(`  ✓ ${book.title} - already has categories`);
					continue;
				}

				// Fetch categories from Google Books API
				console.log(`  🔍 Fetching categories for: ${book.title}`);
				const categories = await fetchBookCategories(book.isbn);

				updatedFavorites.push({
					...book,
					categories: categories,
				});

				if (categories.length > 0) {
					console.log(`  ✅ Added categories: ${categories.join(", ")}`);
					updatedCount++;
				} else {
					console.log(`  ⚠️  No categories found`);
				}

				// Rate limiting - wait 100ms between API calls
				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			// Update user in database
			await db.collection("users").updateOne(
				{ _id: user._id },
				{
					$set: { favoriteBooks: updatedFavorites },
				}
			);

			console.log(
				`\n✨ Updated ${updatedCount} books for user ${user.email}\n`
			);
		}

		console.log("\n🎉 Migration complete!");
		process.exit(0);
	} catch (err) {
		console.error("❌ Migration failed:", err);
		process.exit(1);
	}
}

db.on("error", console.error.bind(console, "❌ Connection error:"));
db.once("open", () => {
	console.log("✅ Connected to MongoDB");
	migrateFavorites();
});
