const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 
const crypto = require('crypto'); 
const User = require('../models/User');
require('dotenv').config(); 
const sendMail = require("../config/mailer");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.get("/verify-email", async (req, res) => {
    try {
        const { token } = req.query;

        // Find user by token
        const user = await User.findOne({ emailVerificationToken: token });
        if (!user) {
            return res.status(400).json({ error: "Invalid or expired verification token" });
        }

        // Mark user as verified and remove the token
        user.isVerified = true;
        user.emailVerificationToken = null;
        await user.save();

        res.status(200).json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString("hex");

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            emailVerificationToken,
            isVerified: false
        });

        await newUser.save();

        // Send verification email
        const verificationLink = `http://localhost:3000/verify-email?token=${emailVerificationToken}`;
        await sendMail(email, "Email Verification", `Click the link to verify your email: ${verificationLink}`);

        res.status(201).json({ message: "User registered successfully. Please check your email to verify your account." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email before logging in.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, userType: user.userType }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            message: 'Login successful', 
            token,
            userType: user.userType 
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};


router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Generate Reset Token
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // 1-hour expiration

        await user.save();

        // Generate Reset Link
        const resetLink = `${process.env.APP_URL}/reset-password/${resetToken}`;
        await sendMail(
            user.email,
            "Password Reset Request",
            `Click the link below to reset your password:\n\n${resetLink}\n\nIf you didn't request this, ignore this email.`
        );

        res.json({ message: "Password reset email sent!" });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ error: "Server error" });
    }
});


router.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }, // Ensure token is valid
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        // Hash new password
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpiry = null;

        await user.save();

        res.json({ message: "Password reset successful!" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router; 
