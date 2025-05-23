const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();
const Review = require("../models/Review"); // Import the Review model
const Test = require("../models/Test");
const AstigmatismTest = require('../models/AstigmatismTest');
const ColorBlindnessTest = require("../models/ColorBlindnessTest");
const vader = require('vader-sentiment');
const { LanguageServiceClient } = require("@google-cloud/language");
const client = new LanguageServiceClient();
const sendMail = require("../config/mailer"); // Import the sendMail function

// Route to fetch gender data
router.get('/gender-distribution', async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find({}, { gender: 1 }); // Only fetch the gender field

    // Count the number of users for each gender
    const maleCount = users.filter(user => user.gender === 'Male').length;
    const femaleCount = users.filter(user => user.gender === 'Female').length;
    const otherCount = users.filter(user => user.gender === 'Other').length;

    // Send the gender counts as a response
    res.status(200).json({
      success: true,
      data: {
        male: maleCount,
        female: femaleCount,
        other: otherCount,
      },
    });
  } catch (error) {
    console.error('Error fetching gender data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gender data',
    });
  }
});

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


async function analyzeSentiment(text) {
  const document = {
    content: text,
    type: "PLAIN_TEXT",
  };

  const [result] = await client.analyzeSentiment({ document });
  return result.documentSentiment;
}



// Route to fetch reviews data
router.get("/reviewsDashboard", async (req, res) => {
  try {
    // Fetch all reviews from the database
    const reviews = await Review.find({});

    // Count anonymous and non-anonymous reviews
    const anonymousCount = reviews.filter((review) => review.user.startsWith("Anonymous#")).length;
    const nonAnonymousCount = reviews.length - anonymousCount;

    // Perform sentiment analysis on each review
    const analyzedReviews = reviews.map((review) => {
      // Ensure the review.review field exists and is a string
      if (!review.review || typeof review.review !== "string") {
        console.warn("Skipping review with invalid or missing text:", review._id);
        return null; // Skip this review
      }

      const result = vader.SentimentIntensityAnalyzer.polarity_scores(review.review); // Analyze the review text
     
      return {
        review: review.review,
        sentiment: result.compound, // Compound score (ranges from -1 to 1)
      };
    }).filter(review => review !== null); // Filter out null values (invalid reviews)

    // Calculate overall sentiment counts
    let positive = 0;
    let neutral = 0;
    let negative = 0;
    analyzedReviews.forEach((review) => {
      if (review.sentiment > 0.05) positive++; // Positive if compound score > 0.05
      else if (review.sentiment < -0.05) negative++; // Negative if compound score < -0.05
      else neutral++; // Neutral otherwise
    });

   
    // Send the counts, reviews, and sentiment analysis as a response
    res.status(200).json({
      anonymousCount,
      nonAnonymousCount,
      reviews: analyzedReviews,
      sentiment: { positive, neutral, negative }, // Ensure this is included
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews data" });
  }
});
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
  const { isActivate } = req.body; // Make sure you're using isActivate in the request body

  try {
    // Find the user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's activation status
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isActivate },
      { new: true }
    );

    // If the user is being deactivated, send a deactivation notice
    if (isActivate === "Deactivated") {
      const subject = "Account Deactivation Notice";
      const text = `Dear ${user.name},\n\nYour account has been deactivated. If this was a mistake, please contact our support team.\n\nBest regards,\nOptic AI Team`;

      // Use the sendMail function to send the deactivation notice
      await sendMail(user.email, subject, text);
      console.log(`Deactivation notice sent to ${user.email}`);
    }

    // Respond with success message and updated user data
    res.json({ message: "User activation status updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user activation status or sending email:", error);
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
      const { name, email, password, address, userType, gender } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ error: "Email already in use" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user (simplified without verification tokens)
      const newUser = await User.create({ 
          name, 
          email, 
          password: hashedPassword, 
          address, 
          userType,
          gender,
          isVerified: true, // Mark as verified by default for admin-created users
          isActivate: "Activated" // Default to Activated for admin-created users
      });

      res.status(201).json({ 
          message: "User created successfully", 
          id: newUser._id 
      });
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



// Updated diagnosis-counts route
router.get("/diagnosis-counts", async (req, res) => {
  try {
    const matchStage = {};
    if (req.query.userId) {
      matchStage.user = mongoose.Types.ObjectId(req.query.userId);
    }

    const diagnosisCounts = await Test.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$diagnosis",
          count: { $sum: 1 }
        }
      }
    ]);

    // Initialize all possible categories from your Python function with 0 counts
    const categories = [
      "Normal vision",
      "Very mild nearsightedness",
      "Mild nearsightedness",
      "Moderate nearsightedness",
      "Significant nearsightedness",
      "Very mild farsightedness",
      "Mild farsightedness",
      "Moderate farsightedness",
      "Significant farsightedness",
      "Very mild vision impairment",
      "Mild vision impairment",
      "Moderate vision impairment",
      "Moderate to significant impairment",
      "Significant vision impairment",
      "Very severe impairment"
    ];

    // Format the response with all categories
    const formattedData = {};
    categories.forEach(category => {
      formattedData[category] = 0;
    });

    // Update with actual counts from database
    diagnosisCounts.forEach(item => {
      if (categories.includes(item._id)) {
        formattedData[item._id] = item.count;
      }
    });

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching diagnosis counts:", error);
    res.status(500).json({ error: "Failed to fetch diagnosis counts" });
  }
});
module.exports = router;
