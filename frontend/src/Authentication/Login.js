import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; 
import { Link, useNavigate } from 'react-router-dom'; 
import Navbar from '../Navigation/Navbar'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
  
      // Store token, email, userType, and userId in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('email', email);
      localStorage.setItem('userType', response.data.userType);
      localStorage.setItem('userId', response.data.userId);  // Store userId here
  
      // Show success toast at bottom-right
      toast.success('Login successful!', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
  
      setTimeout(() => {
        if (response.data.userType === 'admin') {
          navigate('/adminHome'); 
        } else {
          navigate('/home'); 
        }
      }, 2000);
  
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password');
  
      // Show error toast at bottom-right
      toast.error('Invalid email or password!', {
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
    <>
      <ToastContainer /> 
      <Navbar /> 
      <div className="login-container">
        <div className="overlay"></div> {/* Dark overlay for better contrast */}
        {/* Left Side */}
        <div className="left-side">
          <h1>OpticAI</h1>
          <h2>Welcome to OpticAI</h2>
          <p>Empowering Vision, Enhancing Care</p>
        </div>

        {/* Right Side */}
        <div className="right-side">
          <h2 className="login-title">Login</h2>
          <p className="login-subtext">Welcome! Login to access your OpticAI dashboard.</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">User Name</label>
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

            <div className="remember-me">
              <input 
                type="checkbox" 
                id="rememberMe" 
                checked={rememberMe} 
                onChange={() => setRememberMe(!rememberMe)} 
              />
              <label htmlFor="rememberMe"> Remember me</label>
            </div>

            <button type="submit" className="login-btn">LOGIN</button>

            <div className="extra-links">
              <p>New User? <Link to="/signup" className="signup-link">Signup</Link></p>
              <Link to="/forgot-password" className="forgot-password-link">Forgot your password?</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
