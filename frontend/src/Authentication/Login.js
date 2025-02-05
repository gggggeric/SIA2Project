import React from 'react';
import './Login.css'; // Import the CSS file for styling
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom'; // Import Link for navigation

const LoginPage = () => {
  return (
    <div className="login-container">
      <div className="left-side">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="separator"></div>
      <div className="right-side">
        <h2>Welcome</h2>
        <form>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" />
            {/* Forgot Password link */}
            <a href="/forgot-password" className="forgot-password-link">Forgot Password?</a>
          </div>
          <div className="button-container">
            {/* Wrap the Sign Up Link outside the button to prevent squishing */}
            <Link to="/signup" className="signup-link">
              <button type="button" className="signup-btn">Sign Up</button>
            </Link>
            <button type="submit">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
