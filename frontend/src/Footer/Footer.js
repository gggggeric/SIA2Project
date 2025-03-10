import React, { useState, useEffect } from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Footer.css';

const Footer = () => {
  const [review, setReview] = useState('');
  const [userType, setUserType] = useState(localStorage.getItem('userType'));

  // Function to update userType from localStorage
  const updateUserType = () => {
    setUserType(localStorage.getItem('userType'));
  };

  // Manually update userType when the component mounts or when localStorage changes in the same tab
  useEffect(() => {
    updateUserType();
  }, []); // Empty dependency array ensures this runs only on mount

  // Listen for changes in localStorage (for same-tab updates)
  useEffect(() => {
    const interval = setInterval(() => {
      updateUserType();
    }, 1000); // Check for changes every second

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          // Dismiss any existing toasts before showing a new one
          toast.dismiss();

          // Show success toast with a unique toastId
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

          // Dismiss the toast after navigation (if needed)
          setTimeout(() => {
            if (toast.isActive(toastId)) {
              toast.dismiss(toastId);
            }
          }, 3000);
        } else {
          // Dismiss any existing toasts before showing a new one
          toast.dismiss();

          // Show error toast
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

        // Dismiss any existing toasts before showing a new one
        toast.dismiss();

        // Show error toast
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
      // Dismiss any existing toasts before showing a new one
      toast.dismiss();

      // Show warning toast
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
          </div>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </a>
          </div>
          <p className="copyright">&copy; {new Date().getFullYear()} Optic AI </p>
        </div>
      </div>

      {/* ToastContainer with proper configuration */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </footer>
  );
};

export default Footer;