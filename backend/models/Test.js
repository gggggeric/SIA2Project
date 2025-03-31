const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  testType: {
    type: String,
    enum: ["botheyes", "righteye", "lefteye"],
    required: true,
  },
  estimatedEyeGrade: {
    type: String,
    required: true,
  },
  diagnosis: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Add index for faster queries
TestSchema.index({ user: 1, testType: 1 });

module.exports = mongoose.model("Test", TestSchema);