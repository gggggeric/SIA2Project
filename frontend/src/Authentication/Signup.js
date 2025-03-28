import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Reuse the same CSS file
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Navigation/Navbar';
import { toast } from 'react-toastify'; // Import toast (not ToastContainer)
import loginGif from '../assets/GIF/login3.gif';

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState(''); // Selected gender
  const [customGender, setCustomGender] = useState(''); // Custom gender input
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

    // Determine the final gender value
    const finalGender = gender === 'Other' ? customGender : gender;

    try {
      const response = await axios.post('http://localhost:5001/auth/register', {
        name,
        email,
        password,
        gender: finalGender, // Send the final gender value
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

      // Reset form fields
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setGender('');
      setCustomGender('');

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Signup error:', err);

      if (err.response && err.response.data.error === 'Email already in use') {
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
      <div className="auth-page-wrapper">
        <div className="login-container">
          {/* Left Side */}
          <div className="auth-left-side">
            <img src={loginGif} alt="Login Animation" className="login-gif" />
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

              <div className="input-group">
  <label htmlFor="gender">Gender</label>
  <select
    id="gender"
    className="gender-dropdown" // Add a class name
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    required
  >
    <option value="" disabled>Select your gender</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>
</div>
              {/* Show custom gender input if "Other" is selected */}
              {gender === 'Other' && (
                <div className="input-group">
                  <label htmlFor="customGender">Specify your gender</label>
                  <input
                    type="text"
                    id="customGender"
                    value={customGender}
                    onChange={(e) => setCustomGender(e.target.value)}
                    required
                  />
                </div>
              )}

              <button type="submit" className="login-btn">
                Sign Up
              </button>

              <div className="extra-links">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="login-link">
                    Login
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;