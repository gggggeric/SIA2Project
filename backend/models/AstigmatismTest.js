const mongoose = require('mongoose');

const astigmatismTestSchema = new mongoose.Schema({
  userId: {
    type: String, // Storing `userId` as a string to match your localStorage format
    required: true,
  },
  lines: {
    type: String,
    required: true,
  },
  result: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AstigmatismTest', astigmatismTestSchema);
