import React, { useState } from 'react';
import { Typography, Paper, Container, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import Navbar from '../Navigation/Navbar'; // Import the Navbar component
import termsOfServiceImage from '../assets/termsOfService.png'; // Import the image
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Import the expand icon

const TermsOfService = () => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <>
      <Navbar /> {/* Add the Navbar */}
      <Container
        maxWidth="lg"
        sx={{
          mt: 8,
          mb: 4,
          padding: { xs: '2rem 1rem', md: '4rem 2rem' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column-reverse', md: 'row' },
            gap: { xs: '2rem', md: '4rem' },
          }}
        >
          {/* Left Side - Terms of Service Content */}
          <Box sx={{ maxWidth: { xs: '100%', md: '50%' }, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography
              variant="h3"
              sx={{
                color: '#2a2250',
                fontWeight: 'bold',
                marginBottom: '1rem',
                fontFamily: "'Poppins', sans-serif",
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              }}
            >
              Terms of Service
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: '#2a2250',
                fontWeight: '500',
                marginBottom: '1rem',
                fontFamily: "'Poppins', sans-serif",
                fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
              }}
            >
              Empowering Vision, Enhancing Care
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#555',
                marginBottom: '2rem',
                lineHeight: 1.6,
                fontFamily: "'Open Sans', sans-serif",
              }}
            >
              Optic AI transforms optical care using advanced AI to analyze face shapes for frame recommendations, predict eye grades accurately, and find nearby optical shops within 5KM. It offers personalized, seamless, and precise vision solutions in one platform.
            </Typography>
          </Box>

          {/* Right Side - Image */}
          <Box sx={{ maxWidth: { xs: '100%', md: '50%' }, width: '100%' }}>
            <Paper
              elevation={12}
              sx={{
                padding: '1.5rem',
                borderRadius: '20px',
                backgroundColor: '#fff',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0px 15px 40px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              <img
                src={termsOfServiceImage}
                alt="Terms of Service Illustration"
                style={{
                  width: '100%',
                  borderTopLeftRadius: '20px',
                  borderTopRightRadius: '20px',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '10px',
                  backgroundColor: '#2a2250',
                  borderTopLeftRadius: '20px',
                  borderTopRightRadius: '20px',
                }}
              />
            </Paper>
          </Box>
        </Box>

        {/* Collapsible Terms of Service Content */}
        <Box sx={{ mt: 6 }}>
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
              boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Section 1 - Acceptance of Terms */}
            <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2a2250' }}>
                  1. Acceptance of Terms
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ color: '#555' }}>
                  By using Optic AI, you agree to these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you must not use our services. These terms apply to all users of the platform, including visitors, registered users, and contributors of content.
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* Section 2 - Description of Services */}
            <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2a2250' }}>
                  2. Description of Services
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ color: '#555' }}>
                  Optic AI provides the following services:
                  <ul>
                    <li>
                      <strong>Eye Grade Prediction:</strong> Using advanced AI algorithms and microphone readability, our system analyzes your responses to predict your eye grade. This feature is designed to provide an estimate and is not a substitute for professional medical advice.
                    </li>
                    <li>
                      <strong>Optical Shop Locator:</strong> Our system helps you find nearby optical shops within a specified radius. The accuracy of the locations depends on the data provided by third-party services.
                    </li>
                    <li>
                      <strong>Face Shape Analysis:</strong> Using facial recognition technology, our system analyzes your face shape to recommend the best glasses frame for you. This feature is for informational purposes only and does not guarantee suitability.
                    </li>
                  </ul>
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* Section 3 - User Responsibilities */}
            <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2a2250' }}>
                  3. User Responsibilities
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ color: '#555' }}>
                  You are responsible for:
                  <ul>
                    <li>Providing accurate and complete information during the eye grade prediction process.</li>
                    <li>Ensuring that your device's microphone is functioning properly for accurate results.</li>
                    <li>Using the optical shop locator responsibly and verifying the details of the shops before visiting.</li>
                    <li>Maintaining the confidentiality of your account and password.</li>
                  </ul>
                  You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* Section 4 - Prohibited Activities */}
            <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2a2250' }}>
                  4. Prohibited Activities
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ color: '#555' }}>
                  You may not use our services for any illegal or unauthorized purpose. This includes, but is not limited to:
                  <ul>
                    <li>Violating any laws or regulations.</li>
                    <li>Uploading or distributing harmful or malicious content.</li>
                    <li>Attempting to gain unauthorized access to our systems or networks.</li>
                    <li>Misusing the eye grade prediction or face shape analysis features for fraudulent purposes.</li>
                  </ul>
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* Section 5 - Medical Disclaimer */}
            <Accordion expanded={expanded === 'panel5'} onChange={handleChange('panel5')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2a2250' }}>
                  5. Medical Disclaimer
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ color: '#555' }}>
                  The eye grade prediction feature is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified optometrist or ophthalmologist for accurate eye care. Optic AI is not responsible for any decisions made based on the results provided by the system.
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* Section 6 - Limitation of Liability */}
            <Accordion expanded={expanded === 'panel6'} onChange={handleChange('panel6')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2a2250' }}>
                  6. Limitation of Liability
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ color: '#555' }}>
                  Optic AI shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our services. This includes, but is not limited to:
                  <ul>
                    <li>Inaccuracies in eye grade predictions or face shape analysis.</li>
                    <li>Errors in the optical shop locator results.</li>
                    <li>Any harm caused by misuse of the platform.</li>
                  </ul>
                  Our services are provided "as is" without warranties of any kind, either express or implied.
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* Section 7 - Changes to Terms */}
            <Accordion expanded={expanded === 'panel7'} onChange={handleChange('panel7')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2a2250' }}>
                  7. Changes to Terms
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ color: '#555' }}>
                  We may update these Terms of Service from time to time. Any changes will be posted on this page, and your continued use of our services after such changes constitutes your acceptance of the new terms.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default TermsOfService;