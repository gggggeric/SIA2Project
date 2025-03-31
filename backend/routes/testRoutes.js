const express = require("express");
const router = express.Router();
const Test = require("../models/Test");
const User = require("../models/User");

// Save or update test results
router.post("/save-test-results", async (req, res) => {
  const { userId, testType, estimatedEyeGrade, diagnosis } = req.body;

  try {
    // Validate input
    if (!userId || !testType || !estimatedEyeGrade || !diagnosis) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check for existing test of the same type within the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingTest = await Test.findOne({
      user: userId,
      testType,
      createdAt: { $gte: twentyFourHoursAgo }
    });

    let savedTest;

    if (existingTest) {
      // Update existing test
      existingTest.estimatedEyeGrade = estimatedEyeGrade;
      existingTest.diagnosis = diagnosis;
      existingTest.updatedAt = new Date();
      savedTest = await existingTest.save();
    } else {
      // Create new test
      const newTest = new Test({
        user: userId,
        testType,
        estimatedEyeGrade,
        diagnosis
      });
      savedTest = await newTest.save();
    }

    res.status(200).json({ 
      message: existingTest ? "Test results updated successfully" : "Test results saved successfully",
      test: savedTest 
    });
  } catch (error) {
    console.error("Error saving test results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// // Get all test results for a user
// router.get("/get-test-results/:userId", async (req, res) => {
//   const { userId } = req.params;

//   try {
//     // Check if the user exists
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Fetch all test results for the user, sorted by date (newest first)
//     const testResults = await Test.find({ user: userId })
//       .sort({ createdAt: -1 })
//       .lean();

//     // Group by test type and get most recent for each
//     const latestResults = testResults.reduce((acc, test) => {
//       if (!acc[test.testType]) {
//         acc[test.testType] = test;
//       }
//       return acc;
//     }, {});

//     res.status(200).json({ 
//       allResults: testResults,
//       latestResults: latestResults
//     });
//   } catch (error) {
//     console.error("Error fetching test results:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // Get specific test type result (most recent)
// router.get("/get-test-result/:userId/:testType", async (req, res) => {
//   const { userId, testType } = req.params;

//   try {
//     // Check if the user exists
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Get most recent test of specified type
//     const testResult = await Test.findOne({ 
//       user: userId, 
//       testType 
//     }).sort({ createdAt: -1 });

//     if (!testResult) {
//       return res.status(404).json({ message: "No test results found for this type" });
//     }

//     res.status(200).json({ testResult });
//   } catch (error) {
//     console.error("Error fetching test result:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });


// Get all test results for a user
router.get("/get-test-results/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all test results for the user, sorted by date (newest first)
    const testResults = await Test.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ 
      allResults: testResults,
    });
  } catch (error) {
    console.error("Error fetching test results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;