import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Filter } from 'bad-words';
import './Footer.css';

const Footer = () => {
  const [review, setReview] = useState('');
  const [userType, setUserType] = useState(localStorage.getItem('userType'));

  // Initialize the bad-words filter
  const filter = new Filter();

  const updateUserType = () => {
    setUserType(localStorage.getItem('userType'));
  };

  useEffect(() => {
    updateUserType();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateUserType();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for bad words using the filter
    if (filter.isProfane(review)) {
      toast.dismiss();
      toast.error('Your review contains inappropriate language. Please revise it.', {
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

    if (review.trim()) {
      const userEmail = localStorage.getItem('email');
      const user = userEmail || `Anonymous#${Math.floor(Math.random() * 10000)}`;

      try {
        const response = await fetch('http://localhost:5001/reviews/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user, review }),
        });

        if (response.ok) {
          toast.dismiss();
          const toastId = toast.success('Review submitted successfully!', {
            position: 'bottom-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'colored',
          });

          setReview('');

          setTimeout(() => {
            if (toast.isActive(toastId)) {
              toast.dismiss(toastId);
            }
          }, 3000);
        } else {
          toast.dismiss();
          toast.error('Failed to submit review. Please try again.', {
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
        toast.dismiss();
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
    } else {
      toast.dismiss();
      toast.warning('Please enter a review before submitting.', {
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
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-review">
          <h3>Happy with our service? Submit a review!</h3>
          {userType === 'admin' ? (
            <div className="admin-message">
              <p>You're an admin, you cannot submit a review.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="review-form">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review here..."
                className="review-textbox"
                rows="2"
              />
              <button type="submit" className="review-button">
                Submit Review
              </button>
            </form>
          )}
        </div>

        <div className="footer-right">
          <div className="footer-links">
            <a href="/">Home</a>
            <a href="/about">About Us</a>
            <Link to="/reviews">View Reviews</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
          <p className="copyright">&copy; {new Date().getFullYear()} Optic AI </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;