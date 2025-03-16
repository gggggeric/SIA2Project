import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Authentication/Login";
import SignUp from "./Authentication/Signup";
import HomePage from "./Home/Home";
import RequirementsPage from "./Intructions/Requirements";
import ProtectedRoute from "./ProtectedRoute";
import RemindersPage from "./Intructions/Reminders";
import VisionExamPage from "./Process/VisionExam";
import About from "./Home/About";
import ForgotPassword from "./Authentication/ForgotPassword";
import ResetPassword from "./Authentication/ResetPassword";
import FaceShapeDetector from "./Process/FaceShapeDetector";
import OpticalShops from "./Process/OpticalShops";
import AdminHome from "./Admin/AdminHome";
import UserCrudPage from "./Admin/UserCrud";
import EmailVerification from "./Authentication/EmailVerification";
import EditProfile from "./Profile/EditProfile";
import UserActivationPage from "./Admin/UserActivationPage";
import Footer from "./Footer/Footer"; // Import the Footer component
import ReviewsPage from "./Home/Review";
import "./App.css"; // Import global styles
import AdminReviewsPage from "./Admin/AdminReviews";
import AstigmatismTest from "./Process/AstigmatismExam";
import ColorBlindTest from "./Process/ColorBlindTest";
import TermsOfService from "./Home/TermsOfService";

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/about" element={<About />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/process/faceshape-detector" element={<FaceShapeDetector />} />
            <Route path="/process/near-opticalshops" element={<OpticalShops />} />
            <Route path="/instructions/requirements" element={<RequirementsPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/process/astigmatism-exam" element={<AstigmatismTest />} />
            <Route path="/process/colorblind-exam" element={<ColorBlindTest />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            {/* <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            /> */}
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
                  <VisionExamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminHome"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminHome />
                </ProtectedRoute>
              }
            />
             <Route
              path="/adminReply"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminReviewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminUserCRUD"
              element={
                <ProtectedRoute adminOnly={true}>
                  <UserCrudPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminUserActivation"
              element={
                <ProtectedRoute adminOnly={true}>
                  <UserActivationPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        <Footer /> {/* Add the Footer component here */}
      </div>
    </Router>
  );
}

export default App;