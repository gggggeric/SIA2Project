import React, { useState } from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const [review, setReview] = useState(''); // State to store the review text

  const handleSubmit = (e) => {
    e.preventDefault();
    if (review.trim()) {
      alert(`Thank you for your review: "${review}"`); // Replace with your submission logic
      setReview(''); // Clear the text box after submission
    } else {
      alert('Please enter a review before submitting.'); // Validation message
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Review Section (Positioned on the Left) */}
        <div className="footer-review">
          <h3>Happy with our service? Submit a review!</h3>
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
        </div>

        {/* Footer Links and Social Icons (Positioned on the Right) */}
        <div className="footer-right">
          <div className="footer-links">
            <a href="/">Home</a>
            <a href="/about">About Us</a>
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
          {/* Copyright Section */}
          <p className="copyright">&copy; {new Date().getFullYear()} OpticAI.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;