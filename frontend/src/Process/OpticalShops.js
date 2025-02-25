import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../Navigation/Navbar";
import "./OpticalShops.css"; // Make sure the styles are correctly imported

// Function to fetch nearby optical shops using Overpass API
const fetchOpticalShops = async (lat, lon) => {
  try {
    const overpassQuery = `
      [out:json];
      (
        node["shop"="optician"](around:5000, ${lat}, ${lon});
      );
      out;
    `;

    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
    );
    const data = await response.json();

    return data.elements.map((shop) => ({
      lat: shop.lat,
      lon: shop.lon,
      name: shop.tags.name || "Unnamed Optical Shop",
    }));
  } catch (error) {
    console.error("Error fetching optical shops:", error);
    return [];
  }
};

const OpticalShops = () => {
  const [location, setLocation] = useState(null);
  const [shops, setShops] = useState([]);
  const [error, setError] = useState("");

  // Get user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("Location retrieved:", position);
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        // Fetch nearby optical shops
        const data = await fetchOpticalShops(latitude, longitude);
        setShops(data);
      },
      (error) => {
        console.error("Geolocation Error:", error);
        switch (error.code) {
          case 1:
            setError("Location access denied. Please enable it in your browser settings.");
            break;
          case 2:
            setError("Location unavailable. Try again later.");
            break;
          case 3:
            setError("Location request timed out. Please refresh and try again.");
            break;
          default:
            setError("An unknown error occurred while fetching location.");
        }
      }
    );
  }, []);

  // Open Google Maps when "Get Directions" is clicked
  const handleGetDirections = (shop) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`;
    window.open(googleMapsUrl, "_blank"); // Opens in a new tab
  };

  return (
    <div className="optical-shops-page">
      <Navbar />
      <div className="optical-shops-content">
        <h1 className="page-title">Nearby Optical Shops (Within 5km)</h1>

        {error ? (
          <p className="error-text">{error}</p>
        ) : location ? (
          <div className="map-location-container">
            {/* Map */}
            <MapContainer
              center={[location.latitude, location.longitude]}
              zoom={14}
              className="map-container"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* User's location marker */}
              <Marker position={[location.latitude, location.longitude]}>
                <Popup>You are here</Popup>
              </Marker>

              {/* Optical shop markers */}
              {shops.map((shop, index) => (
                <Marker key={index} position={[shop.lat, shop.lon]}>
                  <Popup>
                    <b>{shop.name}</b>
                    <br />
                    <button className="direction-btn" onClick={() => handleGetDirections(shop)}>
                      Get Directions
                    </button>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Location List */}
            <div className="location-list">
              <h2>Nearby Optical Shops</h2>
              <ul>
                {shops.map((shop, index) => (
                  <li key={index}>
                    {shop.name}
                    <button className="direction-btn" onClick={() => handleGetDirections(shop)}>
                      Get Directions
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="loading-text">Fetching your location...</p>
        )}
      </div>
    </div>
  );
};

export default OpticalShops;
