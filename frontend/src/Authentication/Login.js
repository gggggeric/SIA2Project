import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; 
import logo from '../assets/login.png';
import { Link, useNavigate } from 'react-router-dom'; 
import Navbar from '../Navigation/Navbar'; 

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:5001/auth/login', {
        email,
        password
      });
  
      console.log('Login successful:', response.data); 
      console.log('JWT Token:', response.data.token); 
      
      // Store token, email, and userType in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('email', email); 
      localStorage.setItem('userType', response.data.userType); // Store userType

      console.log(response.data.userType); 
      // Navigate based on user type
      if (response.data.userType === 'admin') {
        navigate('/adminHome'); 
      } else {
        navigate('/home'); 
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password');
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
          <h2>Welcome</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
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
              <a href="/forgot-password" className="forgot-password-link">Forgot Password?</a>
            </div>
            <div className="button-container">
              <Link to="/signup" className="signup-link">
                <button type="button" className="signup-btn">Sign Up</button>
              </Link>
              <button type="submit">Login</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
