const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const fs = require('fs');
const path = require('path');
const router = express.Router();
const crypto = require('crypto'); 

// Set up Multer for file uploading
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        
        // Ensure the "uploads" folder exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        cb(null, uploadDir);  // Store images in the "uploads" folder temporarily
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname); // Append timestamp to avoid filename conflicts
    }
});

const upload = multer({ storage: storage });

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

router.put("/users/:id", async (req, res) => {
    const { name, address, password } = req.body; // Get name, address, and password from the request body
  
    try {
      // Find the user by ID
      const user = await User.findById(req.params.id);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Update name and address
      user.name = name || user.name;
      user.address = address || user.address;
  
      // If a new password is provided, hash it and update it
      if (password) {
        const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password
        user.password = hashedPassword;
      }
  
      // Save the updated user document
      const updatedUser = await user.save();
  
      res.json({ message: "User updated successfully", updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.get("/users/:id", async (req, res) => {
    try {
      // Fetch user data and include the profile image URL and address
      const user = await User.findById(req.params.id)
        .select("name email userType profile address") // Ensure 'address' is included
        .lean();
  
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // If the profile picture is null or missing, return an empty string
      user.profile = user.profile || ""; // Empty string if profile is null or missing
  
      res.json(user); // The response will now include name, email, userType, profile, and address
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
// Route to upload a user's profile image
router.put("/users/:id/uploadProfile", upload.single("profileImage"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Upload the file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);

        // Update the user's profile image URL in the database
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { profile: result.secure_url },
            { new: true }
        ).lean();

        // Delete the local file after uploading to Cloudinary
        fs.unlinkSync(req.file.path);

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "Profile image uploaded successfully", updatedUser });
    } catch (error) {
        console.error("Error uploading profile image:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
