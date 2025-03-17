const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  address: String,
  resetToken: String,
  resetTokenExpiry: Date,
  userType: { type: String, enum: ["user", "admin"], default: "user" },
  emailVerificationToken: String, // Token for email verification
  isVerified: { type: Boolean, default: false }, // Email verified status
  profile: { type: String, default: "" }, // Profile picture URL (Cloudinary)
  isActivate: { 
    type: String, 
    enum: ["Activated", "Deactivated"], 
    default: "Deactivated" 
  }, // New field for activation status
  lastActivity: { type: Date, default: Date.now }, // Timestamp for last activity
});

module.exports = mongoose.model("User", UserSchema);