const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();
const Review = require("../models/Review"); // Import the Review model
const Test = require("../models/Test");
const AstigmatismTest = require('../models/AstigmatismTest');
const ColorBlindnessTest = require("../models/ColorBlindnessTest");

// Fetch all test results grouped by result type
// Fetch all test results grouped by result type
router.get("/color-blindness-counts", async (req, res) => {
  try {
    const results = await ColorBlindnessTest.aggregate([
      {
        // Optional: Filter out invalid or unwanted result values
        $match: {
          result: { $in: ["normal", "mild", "moderate", "severe"] }, // Only include valid results
        },
      },
      {
        $group: {
          _id: "$result", // Group by the result field
          count: { $sum: 1 }, // Count the number of documents in each group
        },
      },
    ]);

    // Initialize counts object
    const counts = {
      normal: 0,
      mild: 0,
      moderate: 0,
      severe: 0,
    };

    // Map results to counts
    results.forEach((result) => {
      if (result._id === "normal") counts.normal = result.count;
      else if (result._id === "mild") counts.mild = result.count;
      else if (result._id === "moderate") counts.moderate = result.count;
      else if (result._id === "severe") counts.severe = result.count;
    });

    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching color blindness counts." });
  }
});
// Fetch data for chart
router.get('/astigmatism-chart', async (req, res) => {
  try {
    const allResults = await AstigmatismTest.find();

    // Initialize counters
    let leftEye = 0;
    let rightEye = 0;
    let bothEyes = 0;
    let noAstigmatism = 0;

    // Categorize results based on the response string
    allResults.forEach((result) => {
      if (result.result.includes('LEFT eye')) {
        leftEye++;
      } else if (result.result.includes('RIGHT eye')) {
        rightEye++;
      } else if (result.result.includes('BOTH eyes')) {
        bothEyes++;
      } else {
        noAstigmatism++;
      }
    });

    // Send categorized data
    res.status(200).json({
      leftEye,
      rightEye,
      bothEyes,
      noAstigmatism,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chart data.' });
  }
});


// Route to fetch reviews data
router.get("/reviewsDashboard", async (req, res) => {
  try {
    // Fetch all reviews from the database
    const reviews = await Review.find({});

    // Count anonymous and non-anonymous reviews
    const anonymousCount = reviews.filter((review) => review.user.startsWith("Anonymous#")).length;
    const nonAnonymousCount = reviews.length - anonymousCount;

    // Send the counts as a response
    res.status(200).json({
      anonymousCount,
      nonAnonymousCount,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews data" });
  }
});

module.exports = router;

router.get("/manageActive", async (req, res) => {
    try {
      const users = await User.find().select("name email isActivate").lean(); // Use isActivate instead of isActive
      res.json({ users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  
  router.put("/user/:id/activate", async (req, res) => {
    const { isActivate } = req.body;  // Make sure you're using isActivate in the request body
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id, 
        { isActivate }, 
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({ message: "User activation status updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Error updating user activation status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
router.get("/userDashboard", async (req, res) => {
    try {
      const users = await User.find().select("name email userType isActivate").lean(); // Added isActivate
  
      // Count users based on their activation status
      const activatedCount = users.filter(user => user.isActivate === "Activated").length;
      const deactivatedCount = users.filter(user => user.isActivate === "Deactivated").length;
  
      // Send both the user data and activation counts in the response
      res.json({
        users: users,
        activatedCount: activatedCount,
        deactivatedCount: deactivatedCount
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
router.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get("users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("name email userType").lean();
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/users", async (req, res) => {
    try {
        const { name, email, password, address, userType } = req.body;

        if (await User.exists({ email })) return res.status(400).json({ message: "Email already in use" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ name, email, password: hashedPassword, address, userType });

        res.status(201).json({ message: "User created successfully", id: newUser._id });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.put("/users/:id", async (req, res) => {
    try {
        const { name, address, userType } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { name, address, userType }, { new: true }).lean();

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User updated successfully", updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.delete("/users/:id", async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id).lean();
        if (!deletedUser) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Endpoint to get diagnosis counts
router.get("/diagnosis-counts", async (req, res) => {
  try {
    const diagnosisCounts = await Test.aggregate([
      {
        $group: {
          _id: "$diagnosis", // Group by diagnosis
          count: { $sum: 1 }, // Count occurrences
        },
      },
    ]);

    // Format the data for the chart
    const formattedData = {
      Nearsighted: 0,
      Farsighted: 0,
      NormalVision: 0,
    };

    diagnosisCounts.forEach((item) => {
      if (item._id.includes("Nearsighted")) {
        formattedData.Nearsighted = item.count;
      } else if (item._id.includes("Farsighted")) {
        formattedData.Farsighted = item.count;
      } else if (item._id.includes("Normal")) {
        formattedData.NormalVision = item.count;
      }
    });

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching diagnosis counts:", error);
    res.status(500).json({ error: "Failed to fetch diagnosis counts" });
  }
});

module.exports = router;
