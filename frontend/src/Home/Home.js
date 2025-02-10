import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import Navbar from "../Navigation/Navbar";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import placeholderImage from "../assets/placeholder.png"; // Import your local image
import "./Home.css"; // Import CSS file

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // Redirect to home if no token
    }
  }, [navigate]);

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "5%",
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

      {/* Background Vector Graphics */}
      <div className="background-vector">
        <svg viewBox="0 0 1440 320">
          <path
            fill="#3b82f6"
            fillOpacity="1"
            d="M0,128L48,144C96,160,192,192,288,181.3C384,171,480,117,576,106.7C672,96,768,128,864,122.7C960,117,1056,75,1152,64C1248,53,1344,75,1392,85.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      <section className="slider-section">
        <div className="slider-container">
          <Slider {...settings}>
            <div className="slide">
              <img src={placeholderImage} alt="Slide 1" className="slide-image" />
            </div>
            <div className="slide">
              <img src={placeholderImage} alt="Slide 2" className="slide-image" />
            </div>
            <div className="slide">
              <img src={placeholderImage} alt="Slide 3" className="slide-image" />
            </div>
          </Slider>

          {/* Get Started Button */}
          <div className="button-container">
            <button onClick={() => navigate("/instructions/requirements")} className="get-started-btn">
              Get Started
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
