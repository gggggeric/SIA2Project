import React from 'react';
import Navbar from '../Navigation/Navbar';
import aboutUsImage from '../assets/aboutus.png';
import '../Home/About.css';

const About = () => {
    return (
        <div className="about-container">
            <Navbar />
            <div className="about-content">
                <img src={aboutUsImage} alt="About Us" className="about-image" />
                <div className="about-text">
                    <h1>About Us</h1>
                    <p>
                        Welcome to our platform! We are dedicated to providing the best services to our users. Our team is passionate about creating seamless experiences through innovative technology and user-friendly design.
                    </p>
                    <p>
                        Our mission is to continuously innovate and enhance our services to meet the evolving needs of our users.
                    </p>
                    <p>
                        Thank you for being a part of our journey. We appreciate your support and look forward to serving you better.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
