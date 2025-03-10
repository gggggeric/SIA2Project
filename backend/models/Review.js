const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  admin: { type: String, required: true }, // Admin's name or ID
  reply: { type: String, required: true }, // Admin's reply
  createdAt: { type: Date, default: Date.now }, // Timestamp of the reply
});

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true }, // User's name or email
  review: { type: String, required: true }, // User's review
  createdAt: { type: Date, default: Date.now }, // Timestamp of the review
  replies: [replySchema], // Array of replies
});

module.exports = mongoose.model('Review', reviewSchema);