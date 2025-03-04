import React, { useState } from 'react';
import axios from 'axios'; 
import './Login.css'; 
import { Link } from 'react-router-dom';
import Navbar from '../Navigation/Navbar'; 
import { FaArrowLeft } from 'react-icons/fa'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match!', {
        position: 'top-right',
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

      // ✅ Show success toast with email verification message
      toast.success('Account created! Please check your email to verify your account.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });

      // Clear form fields
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

    } catch (err) {
      console.error('Signup error:', err);

      // ✅ Show error toast if email is already in use
      if (err.response && err.response.data.error === "Email already in use") {
        toast.error('Email already in use. Please try a different one.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        });
      } else {
        // Generic error message
        toast.error('Failed to sign up. Please try again later.', {
          position: 'top-right',
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
      <ToastContainer /> {/* Toast Container to display messages */}
      <div className="login-container">
        <div className="right-side">
          <div className="back-to-login-container">
            <Link to="/login" className="back-to-login-link">
              <FaArrowLeft className="back-to-login-icon" /> 
            </Link>
          </div>
          <h2>Create an Account</h2>
          
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
