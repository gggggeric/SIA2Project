const express = require("express");
const router = express.Router();
const ColorBlindnessTest = require("../models/ColorBlindnessTest");

// Save test result
router.post("/color-blindness-test", async (req, res) => {
  const { userId, result } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  if (!result) {
    return res.status(400).json({ error: "Result is required." });
  }

  try {
    // Save the result to the database
    const testResult = new ColorBlindnessTest({ userId, result });
    await testResult.save();
    res.status(201).json({ message: "Test result saved successfully!", result });
  } catch (error) {
    res.status(500).json({ error: "Failed to save test result." });
  }
});

// Get user's test result
router.get("/color-blindness-test/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const testResult = await ColorBlindnessTest.findOne({ userId }).sort({ timestamp: -1 });
    if (testResult) {
      res.status(200).json({ result: testResult.result, timestamp: testResult.timestamp });
    } else {
      res.status(404).json({ message: "No test result found for this user." });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching test result." });
  }
});

// Delete user's test result
router.delete("/color-blindness-test/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const deletedResult = await ColorBlindnessTest.deleteMany({ userId });
    if (deletedResult.deletedCount > 0) {
      res.status(200).json({ message: "Test result deleted successfully!" });
    } else {
      res.status(404).json({ message: "No test result found for this user." });
    }
  } catch (error) {
    res.status(500).json({ error: "Error deleting test result." });
  }
});

module.exports = router;