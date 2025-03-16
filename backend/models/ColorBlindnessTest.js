const mongoose = require("mongoose");

const colorBlindnessTestSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  result: {
    type: String,
    required: true,
  },
  correctCount: {
    type: Number, // Add this field to store the number of correct answers
    required: true,
  },
  testType: {
    type: String,
    default: "color_blindness",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ColorBlindnessTest", colorBlindnessTestSchema);