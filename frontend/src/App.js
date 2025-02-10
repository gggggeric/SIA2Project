import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Authentication/Login";
import SignUp from "./Authentication/Signup";
import HomePage from "./Home/Home";
import RequirementsPage from "./Intructions/Requirements";
import ProtectedRoute from "./ProtectedRoute"; 
import RemindersPage from "./Intructions/Reminders"; 
import BothEyePage from "./Process/BothEye"; 
import LandingPage from "./Home/Landing";
import About from "./Home/About";

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/instructions/requirements"
          element={
            <ProtectedRoute>
              <RequirementsPage />
            </ProtectedRoute>
          }
        />

 
        <Route
          path="/instructions/reminders"
          element={
            <ProtectedRoute>
              <RemindersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/process/both-eye"
          element={
            <ProtectedRoute>
              <BothEyePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
