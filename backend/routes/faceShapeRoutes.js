const express = require("express");
const FaceShape = require("../models/FaceShape");
const router = express.Router();

// Save or update face shape and recommended glasses
router.post("/save-face-shape", async (req, res) => {
  try {
    const { userId, faceShape, recommendedGlasses } = req.body;

    if (!userId || !faceShape || !recommendedGlasses) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find and update the existing face shape entry for the user, or create a new one if it doesn't exist
    const updatedFaceShape = await FaceShape.findOneAndUpdate(
      { userId }, // Query: Find by userId
      { userId, faceShape, recommendedGlasses }, // Update with new data
      { upsert: true, new: true } // Options: Create if not found, return the updated document
    );

    res.status(201).json({
      message: "Face shape saved/updated successfully",
      data: updatedFaceShape,
    });
  } catch (error) {
    console.error("Error saving/updating face shape:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch face shape history for a user
router.get("/face-shape-history/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const history = await FaceShape.find({ userId }).sort({ timestamp: -1 });

    if (history.length === 0) {
      return res.status(404).json({ message: "No face shape history found for this user" });
    }

    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching face shape history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;