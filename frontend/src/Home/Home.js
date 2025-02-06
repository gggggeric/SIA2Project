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
    <div className="min-h-screen bg-gray-100 pt-20">
      <Navbar /> {/* Navbar component */}

      <section className="text-center p-10">
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
          <div className="mt-12"> {/* This adds a little more space from the carousel */}
            <button
              onClick={() => navigate("/instructions/requirements")} // Redirect to Requirements page
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
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
