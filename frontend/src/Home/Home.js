import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import Navbar from "../Navigation/Navbar";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.png";
import image3 from "../assets/image3.png";
import "./Home.css"; // Import CSS file

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // Redirect to home if no token
    }
  }, [navigate]);

  // Slider settings for smooth conveyor belt effect
  const settings = {
    dots: false,
    infinite: true,
    speed: 2000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    centerMode: true,
    centerPadding: "5%",
    focusOnSelect: true,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          centerPadding: "5%",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerPadding: "0%",
        },
      },
    ],
  };

  return (
    <div className="home-container">
      <Navbar />

      {/* Carousel Section at the Top */}
      <section className="slider-section">
        <div className="slider-container large-slider">
          <Slider {...settings}>
            <div className="slide card">
              <img src={image1} alt="Slide 1" className="slide-image large-image" />
            </div>
            <div className="slide card">
              <img src={image2} alt="Slide 2" className="slide-image large-image" />
            </div>
            <div className="slide card">
              <img src={image3} alt="Slide 3" className="slide-image large-image" />
            </div>
          </Slider>
        </div>
      </section>

      {/* Hero Section Below Carousel with Spacing */}
      <div className="hero-section" style={{ marginTop: "50px", padding: "20px 0" }}>
        <h1>Welcome to Our Platform</h1>
        <p>Discover amazing features and get started today!</p>
        <button onClick={() => navigate("/instructions/requirements")} className="primary-btn">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default HomePage;
