import React, { useState } from 'react';
import axios from 'axios'; 
import './Login.css'; 
import logo from '../assets/login.png';
import { Link } from 'react-router-dom';
import Navbar from '../Navigation/Navbar'; 
import { FaArrowLeft } from 'react-icons/fa'; 

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await axios.post('http://localhost:5001/auth/register', {
        name,
        email,
        password
      });

      setSuccess('Account created successfully! You can now log in.');
      setError('');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to sign up. Email may already be in use.');
    }
  };

  return (
    <>
      <Navbar /> 
      <div className="login-container">
        <div className="left-side">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="separator"></div>
        <div className="right-side">
          <div className="back-to-login-container">
            <Link to="/login" className="back-to-login-link">
              <FaArrowLeft className="back-to-login-icon" /> 
            </Link>
          </div>
          <h2>Create an Account</h2>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="button-container">
              <button type="submit">Sign Up</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;
