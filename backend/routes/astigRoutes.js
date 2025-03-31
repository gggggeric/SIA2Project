const express = require("express");
const router = express.Router();
const AstigmatismTest = require("../models/AstigmatismTest"); // Assuming you have a Mongoose model

// Save or update test result
router.post('/astigmatism-test', async (req, res) => {
  const { userId, lines, result } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  if (!lines || !result) {
    return res.status(400).json({ error: 'Lines and result are required.' });
  }

  try {
    // Update or create the test result for the user
    const testResult = await AstigmatismTest.findOneAndUpdate(
      { userId },
      { userId, lines, result, timestamp: Date.now() }, // Added timestamp here
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Test result saved successfully!', testResult });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save test result.' });
  }
});

// Updated route to return the correct timestamp field
router.get("/astigmatism-test/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userTest = await AstigmatismTest.findOne({ userId });

    if (!userTest) {
      return res.status(404).json({ message: "No previous test found." });
    }

    res.status(200).json({ 
      result: userTest.result, 
      timestamp: userTest.timestamp // Changed from date to timestamp
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching previous test data." });
  }
});

// Delete user's test result
router.delete("/astigmatism-test/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const deletedTest = await AstigmatismTest.findOneAndDelete({ userId });

    if (!deletedTest) {
      return res.status(404).json({ message: "No previous test found." });
    }

    res.status(200).json({ message: "Previous response deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting previous test data." });
  }
});

module.exports = router;