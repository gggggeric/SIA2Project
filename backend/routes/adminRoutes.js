const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();
const Review = require("../models/Review"); // Import the Review model

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
      console.log("Fetched users from DB:", users);  // Log to ensure the data is correct
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

module.exports = router;
