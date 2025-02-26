const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  address: String,
  resetToken: String, // Token for password reset
  resetTokenExpiry: Date, // Expiration time for token
  userType: { type: String, enum: ["user", "admin"], default: "user" }, // Role-based access
});

module.exports = mongoose.model("User", UserSchema);
