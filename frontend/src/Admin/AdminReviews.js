import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "../Navigation/Navbar";
import './AdminReview.css';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]); // State to store all reviews
  const [filteredReviews, setFilteredReviews] = useState([]); // State to store filtered reviews
  const [replyTexts, setReplyTexts] = useState({}); // State to store reply texts for each review
  const [filter, setFilter] = useState('all'); // State to track the current filter

  // Fetch all reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://localhost:5001/reviews');
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
          setFilteredReviews(data); // Initialize filtered reviews with all reviews
        } else {
          console.error('Failed to fetch reviews');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchReviews();
  }, []);

  // Handle filter change
  useEffect(() => {
    let filtered = reviews;

    if (filter === 'anonymous') {
      filtered = reviews.filter(review => review.user.startsWith('Anonymous'));
    } else if (filter === 'nonAnonymous') {
      filtered = reviews.filter(review => !review.user.startsWith('Anonymous'));
    }

    setFilteredReviews(filtered);
  }, [filter, reviews]);

  // Handle submitting a reply
  const handleReplySubmit = async (reviewId) => {
    const replyText = replyTexts[reviewId] || '';
    const userEmail = localStorage.getItem('email'); // Get the email from localStorage

    if (!replyText.trim()) {
      toast.warning('Please enter a reply before submitting.', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin: userEmail, reply: replyText }), // Include the user's email in the request body
      });

      if (response.ok) {
        toast.success('Reply submitted successfully!', {
          position: 'bottom-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        });
        setReplyTexts(prev => ({ ...prev, [reviewId]: '' })); // Clear the reply text box for this review
        // Refresh the reviews list
        const updatedResponse = await fetch('http://localhost:5001/reviews');
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setReviews(updatedData);
        }
      } else {
        toast.error('Failed to submit reply. Please try again.', {
          position: 'bottom-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred. Please try again.', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
    }
  };

  return (
    <div>
      <Navbar /> {/* Add the Navbar */}
      <div className="admin-reviews-page">
        <h1>Admin Reviews</h1>

        {/* Filter Controls */}
        <div className="filter-controls">
          <button
            onClick={() => setFilter('all')}
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          >
            All Reviews
          </button>
          <button
            onClick={() => setFilter('anonymous')}
            className={`filter-button ${filter === 'anonymous' ? 'active' : ''}`}
          >
            Anonymous Reviews
          </button>
          <button
            onClick={() => setFilter('nonAnonymous')}
            className={`filter-button ${filter === 'nonAnonymous' ? 'active' : ''}`}
          >
            Non-Anonymous Reviews
          </button>
        </div>

        {filteredReviews.length > 0 ? (
          <div className="reviews-list">
            {filteredReviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <p className="review-user">{review.user}</p>
                  <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="review-text">{review.review}</p>

                {/* Display Replies */}
                {review.replies.length > 0 && (
                  <div className="replies-section">
                    <h3>Replies:</h3>
                    {review.replies.map((reply, index) => (
                      <div key={index} className="reply-card">
                        <div className="reply-header">
                          <p className="reply-admin">{reply.admin}</p>
                          <p className="reply-date">{new Date(reply.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p className="reply-text">{reply.reply}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                <div className="reply-form">
                  <textarea
                    value={replyTexts[review._id] || ''}
                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [review._id]: e.target.value }))}
                    placeholder="Write your reply here..."
                    rows="2"
                  />
                  <button
                    onClick={() => handleReplySubmit(review._id)}
                    className="submit-reply-button"
                  >
                    Submit Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-reviews-message">No reviews found for the selected filter.</p>
        )}
      </div>
    </div>
  );
};

export default AdminReviewsPage;