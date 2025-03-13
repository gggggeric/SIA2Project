// routes/testRoutes.js
const express = require("express");
const router = express.Router();
const Test = require("../models/Test");
const User = require("../models/User");

// Save test results
router.post("/save-test-results", async (req, res) => {
  const { userId, testType, estimatedEyeGrade, diagnosis } = req.body;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new test result
    const newTest = new Test({
      user: userId,
      testType,
      estimatedEyeGrade,
      diagnosis,
    });

    // Save the test result
    await newTest.save();

    res.status(201).json({ message: "Test results saved successfully", test: newTest });
  } catch (error) {
    console.error("Error saving test results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get test results for a user
router.get("/get-test-results/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all test results for the user
    const testResults = await Test.find({ user: userId });

    res.status(200).json({ testResults });
  } catch (error) {
    console.error("Error fetching test results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});




module.exports = router;