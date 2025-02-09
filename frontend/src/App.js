import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Authentication/Login";
import SignUp from "./Authentication/Signup";
import HomePage from "./Home/Home";
import RequirementsPage from "./Intructions/Requirements";
import ProtectedRoute from "./ProtectedRoute"; // Import ProtectedRoute
import RemindersPage from "./Intructions/Reminders"; // Import RemindersPage
import BothEyePage from "./Process/BothEye"; // Import the BothEyePage
import LandingPage from "./Home/Landing";
function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protect the HomePage */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Protect the RequirementsPage */}
        <Route
          path="/instructions/requirements"
          element={
            <ProtectedRoute>
              <RequirementsPage />
            </ProtectedRoute>
          }
        />

        {/* Protect the RemindersPage */}
        <Route
          path="/instructions/reminders"
          element={
            <ProtectedRoute>
              <RemindersPage />
            </ProtectedRoute>
          }
        />

        {/* Protect the BothEyePage */}
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
