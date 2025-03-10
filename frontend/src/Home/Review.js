import React, { useEffect, useState } from 'react';
import Navbar from "../Navigation/Navbar";
import './Review.css';
import defaultProfile from '../assets/profile.jpg'; // Import the default profile image

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]); // State to store reviews

  // Fetch reviews from the backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://localhost:5001/reviews');
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          console.error('Failed to fetch reviews');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div>
      <Navbar /> {/* Add the Navbar */}
      <div className="reviews-page">
        <h1>Service Reviews</h1>
        {reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map((review, index) => (
              <div key={index} className="review-item">
                {/* Profile Picture and User Info */}
                <div className="review-user-info">
                  <img
                    src={review.profile || defaultProfile} // Use the default image if no profile picture is fetched
                    alt="Profile"
                    className="review-profile-pic"
                  />
                  <p className="review-user">{review.user || "Anonymous"}</p> {/* Show "Anonymous" if no user is specified */}
                </div>
                <p className="review-text">{review.review}</p>
                <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>

                {/* Display Replies */}
                {review.replies.length > 0 && (
                  <div className="replies-section">
                    <h3>Replies:</h3>
                    {review.replies.map((reply, index) => (
                      <div key={index} className="reply-item">
                        <div className="reply-user-info">
                          <img
                            src={reply.profile || defaultProfile} // Use the default image if no profile picture is fetched
                            alt="Admin Profile"
                            className="reply-profile-pic"
                          />
                          <p className="reply-admin">{reply.admin || "Admin"}</p> {/* Show "Admin" if no admin is specified */}
                        </div>
                        <p className="reply-text">{reply.reply}</p>
                        <p className="reply-date">{new Date(reply.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No reviews yet. Be the first to submit one!</p>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;