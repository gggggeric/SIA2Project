import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Reuse the same CSS file
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Navbar from '../Navigation/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match!', {
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
      const response = await axios.post('http://localhost:5001/auth/register', {
        name,
        email,
        password
      });

      toast.success('Account created! Check your email to verify.', {
        position: 'bottom-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });

      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error('Signup error:', err);

      if (err.response && err.response.data.error === "Email already in use") {
        toast.error('Email already in use. Try a different one.', {
          position: 'bottom-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        });
      } else {
        toast.error('Failed to sign up. Try again later.', {
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
      <Navbar />
      <ToastContainer />
      <div className="login-container">
        {/* Left Side */}
        <div className="left-side">
          <h1>OpticAI</h1>
          <h2>Welcome to OpticAI</h2>
          <p>Empowering Vision, Enhancing Care</p>
        </div>

        {/* Right Side */}
        <div className="right-side">
          <h2>Create an Account</h2>
          <p>Join us and start your journey with OpticAI.</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn">Sign Up</button>

            <div className="extra-links">
              <p>Already have an account? <Link to="/login" className="login-link">Login</Link></p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;