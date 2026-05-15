// src/config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MongoDB connection string is missing. Set MONGO_URI or MONGODB_URI in BACKEND/.env.');
    }

    await mongoose.connect(mongoUri);
    console.log('Database Connected');
  } catch (err) {
    console.error('Database Connection Error:', err.message);
    if (err.message && err.message.toLowerCase().includes('authentication failed')) {
      console.error('Atlas rejected the database credentials in BACKEND/.env. Verify the MongoDB user, password, and allowed database name.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
