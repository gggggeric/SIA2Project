const express = require('express');
const router = express.Router();
const Review = require('../models/Review'); // Correct import path
const User = require('../models/User'); // Import the User model
// Submit a review
router.post('/submit', async (req, res) => {
  try {
    const { user, review } = req.body;
    if (!user || !review) {
      return res.status(400).json({ message: 'User and review are required' });
    }

    const newReview = new Review({ user, review }); // Use the Review model
    await newReview.save();

    res.status(201).json({ message: 'Review submitted successfully', review: newReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Fetch all reviews with user profile pictures
router.get('/', async (req, res) => {
  try {
    // Fetch all reviews and sort by most recent
    const reviews = await Review.find().sort({ createdAt: -1 }).lean();

    // Fetch profile pictures for all users in the reviews
    const reviewsWithProfile = await Promise.all(
      reviews.map(async (review) => {
        // Find the user in the User collection based on the `user` field (email or name)
        const user = await User.findOne({ email: review.user }).select('profile').lean();

        // Fetch profile pictures for admins in replies (if replies exist)
        const repliesWithProfile = review.replies
          ? await Promise.all(
              review.replies.map(async (reply) => {
                const admin = await User.findOne({ email: reply.admin }).select('profile').lean();
                return {
                  ...reply,
                  profile: admin?.profile || '', // Use an empty string if no profile picture exists
                };
              })
            )
          : []; // If replies is undefined, use an empty array

        return {
          ...review,
          profile: user?.profile || '', // Use an empty string if no profile picture exists
          replies: repliesWithProfile, // Include replies with admin profile pictures
        };
      })
    );

    res.status(200).json(reviewsWithProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Submit a reply to a review (Admin only)
router.post('/:reviewId/reply', async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { admin, reply } = req.body;
  
      if (!admin || !reply) {
        return res.status(400).json({ message: 'Admin and reply are required' });
      }
  
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
  
      // Add the reply to the review
      review.replies.push({ admin, reply });
      await review.save();
  
      res.status(201).json({ message: 'Reply submitted successfully', review });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;