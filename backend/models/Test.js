// models/Test.js
const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  testType: {
    type: String,
    enum: ["botheyes", "righteye", "lefteye"], // Use lowercase values
    required: true,
  },
  estimatedEyeGrade: {
    type: String, // Estimated eye grade
    required: true,
  },
  diagnosis: {
    type: String, // Diagnosis from the test
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});





module.exports = mongoose.model("Test", TestSchema);