import React, { useState } from 'react';
import Navbar from '../Navigation/Navbar';

// Import team images
import gianan from '../assets/developers/gianan.png';
import morit from '../assets/developers/morit.png';
import bacala from '../assets/developers/bacala.png';
import gone from '../assets/developers/gone.png';

import styles from '../Home/About.module.css'; // Import CSS Module

const teamMembers = [
    { 
        name: 'Geric', 
        role: 'Lead Developer', 
        image: morit, 
        description: 'Geric is responsible for both frontend and backend development, ensuring seamless integration.',
        email: 'gericmorit3211@gmail.com'
    },
    { 
        name: 'Mico', 
        role: 'Backend Developer', 
        image: gianan, 
        description: 'Mico specializes in backend development, working on APIs and database management.', 
        email: 'micogianan28@gmail.com' 
    },
    { 
        name: 'Nicole', 
        role: 'Frontend Developer', 
        image: bacala, 
        description: 'Nicole focuses on frontend design and implementation to enhance user experience.', 
        email: 'Nicolebacala17@gmail.com' 
    },
    { 
        name: 'Krizel', 
        role: 'UI/UX Designer', 
        image: gone, 
        description: 'Krizel creates intuitive UI/UX designs to make Optic AI visually appealing and user-friendly.', 
        email: 'krizelannegone08@gmail.com' 
    }
];

const About = () => {
    const [selectedMember, setSelectedMember] = useState(null);

    const openModal = (member) => {
        setSelectedMember(member);
    };

    const closeModal = () => {
        setSelectedMember(null);
    };

    return (
        <div className={styles.aboutPageContainer}>
            <Navbar />

            {/* About Us Section */}
            <div className={styles.aboutContent}>
                <h1>About Us</h1>
                <p>
                    Welcome to <strong>Optic AI</strong>! Our system is designed to revolutionize optical care by integrating AI-powered solutions to enhance user experience and provide better vision-related services.
                </p>
            </div>

            {/* Mission, Vision & System Features Section */}
            <div className={styles.groupBox}>
                <div className={styles.mission}>
                    <h2>Our Mission</h2>
                    <p>
                        To provide an AI-powered system that enhances optical care by offering accurate eye-grade predictions, personalized frame suggestions, and accessible optical shop locations.
                    </p>
                </div>
                <div className={styles.vision}>
                    <h2>Our Vision</h2>
                    <p>
                        To become the leading AI-driven optical care platform that empowers individuals to achieve better vision with personalized solutions and advanced technology.
                    </p>
                </div>
                <div className={styles.systemFeatures}>
                    <h2>What Our System Does</h2>
                    <ul>
                        <li><strong>Eye Grade Prediction:</strong> Uses AI to analyze and predict the grade of your eyes.</li>
                        <li><strong>Face Shape Analysis:</strong> Identifies your face shape to suggest the best glasses frame.</li>
                        <li><strong>Optical Shop Locator:</strong> Helps you find nearby optical shops within a 5km radius.</li>
                    </ul>
                </div>
            </div>

            {/* Team Section */}
            <div className={styles.teamSection}>
                <h1>Meet Our Team</h1>
                <div className={styles.teamMembers}>
                    {teamMembers.map((member, index) => (
                        <div key={index} className={styles.teamMember} onClick={() => openModal(member)}>
                            <img src={member.image} alt={member.name} />
                            <h3>{member.name}</h3>
                            <p>{member.role}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {selectedMember && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <span className={styles.closeBtn} onClick={closeModal}>&times;</span>
                        <img src={selectedMember.image} alt={selectedMember.name} />
                        <h3>{selectedMember.name}</h3>
                        <p><strong>{selectedMember.role}</strong></p>
                        <p>{selectedMember.description}</p>
                        <p><strong>Email:</strong> <a href={`mailto:${selectedMember.email}`}>{selectedMember.email}</a></p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default About;