import React from 'react';
import './Login.css'; // Import the CSS file for styling
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom'; // Import Link for navigation

const SignUpPage = () => {
  return (
    <div className="login-container">
      <div className="left-side">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="separator"></div>
      <div className="right-side">
        {/* Back to Login button inside the right-side container */}
        <div className="back-to-login-container">
          <Link to="/" className="back-to-login-link">
            <button type="button" className="back-to-login-btn">Back to Login</button>
          </Link>
        </div>
        <h2>Create an Account</h2>
        <form>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" />
          </div>
          <div className="input-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input type="password" id="confirm-password" name="confirm-password" />
          </div>
          <div className="button-container">
            <button type="submit">Sign Up</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
