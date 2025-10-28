// config/database.js
module.exports = {
	// Use environment variable or fall back to local MongoDB
	// For local MongoDB: Install MongoDB and run 'mongod'
	// For MongoDB Atlas: Set MONGODB_URI in your .env file
	url: process.env.MONGODB_URI || "mongodb://localhost:27017/bookit",
	dbName: "bookit",
};
