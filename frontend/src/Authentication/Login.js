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
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5001/auth/login', {
        email,
        password,
      });

      console.log('Login successful:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('email', email);
      localStorage.setItem('userType', response.data.userType);
      localStorage.setItem('userId', response.data.userId);

      // Show success toast
      toast.success('Login successful!', {
        position: 'bottom-right',
        autoClose: 3000, // Toast will auto-close after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });

      // Wait for the toast to auto-close, then navigate and reload
      setTimeout(() => {
        if (response.data.userType === 'admin') {
          navigate('/adminHome');
        } else {
          navigate('/');
        }
        window.location.reload(); // Reload the page after navigation
      }, 3000); // Match this delay with the toast's autoClose duration
    } catch (err) {
      console.error('Login error:', err);

      if (err.response && err.response.data && err.response.data.message) {
        const errorMessage = err.response.data.message;
        toast.error(errorMessage, {
          position: 'bottom-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        });
      } else {
        toast.error('Invalid email or password', {
          position: 'bottom-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        });
      }
    }
  };

  return (
    <>
      <ToastContainer /> {/* Include ToastContainer to display toasts */}
      <Navbar />
      <div className="auth-page-wrapper">
        <div className="login-container">
          <div className="overlay"></div>
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
      </div>
    </>
  );
};

export default LoginPage;