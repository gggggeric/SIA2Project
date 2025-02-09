import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import Navbar from "../Navigation/Navbar";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import placeholderImage from "../assets/placeholder.png"; // Import your local image

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // Redirect to home if no token
    }
  }, [navigate]);

  // Slider settings (Adjusted Size)
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3, // Keep 3 images visible
    slidesToScroll: 1,
    centerMode: true, // Keeps the middle image centered
    centerPadding: "5%", // Reducing padding for a more balanced width
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
    <div className="min-h-screen bg-gray-100 pt-20 relative overflow-hidden">
      <Navbar /> {/* Navbar component */}
      
      {/* Background Vector Graphics */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <svg
          viewBox="0 0 1440 320"
          className="absolute top-0 left-0 w-full h-auto opacity-30"
        >
          <path
            fill="#3b82f6"
            fillOpacity="1"
            d="M0,128L48,144C96,160,192,192,288,181.3C384,171,480,117,576,106.7C672,96,768,128,864,122.7C960,117,1056,75,1152,64C1248,53,1344,75,1392,85.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>
      
      <section className="text-center p-10 relative">
        <div className="container-fluid px-5" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Slider {...settings}>
            <div className="px-2">
              <img src={placeholderImage} alt="Slide 1" className="w-100 rounded-lg shadow-lg" />
            </div>
            <div className="px-2">
              <img src={placeholderImage} alt="Slide 2" className="w-100 rounded-lg shadow-lg" />
            </div>
            <div className="px-2">
              <img src={placeholderImage} alt="Slide 3" className="w-100 rounded-lg shadow-lg" />
            </div>
          </Slider>

          {/* Get Started Button with adjusted margin */}
          <div className="mt-16"> {/* Increased margin-top to make it lower */}
            <button
              onClick={() => navigate("/instructions/requirements")} // Redirect to Requirements page
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 relative z-10"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
