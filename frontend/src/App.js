import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import Router, Routes, and Route
import Login from "./Authentication/Login";
import SignUp from "./Authentication/Signup";

function App() {
  return (
    <Router> {/* Wrap the app with BrowserRouter */}
      <Routes>
        <Route path="/" element={<Login />} /> {/* Define a route for login */}
        <Route path="/signup" element={<SignUp />} /> {/* Define a route for signup */}
      </Routes>
    </Router>
  );
}

export default App;
