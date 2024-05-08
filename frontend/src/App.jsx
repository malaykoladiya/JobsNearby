import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
  Link,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage";
import LoginForm from "./pages/Login";
import SignUpForm from "./pages/SignUpForm";
import HomePage from "./pages/HomePage";
import SearchJob from "./pages/SearchJobs/SearchJobs"; // Adjust the import path as necessary
import Navbar from "./components/Navbar";
import PostJobPage from "./pages/EmployerPages/PostJobPage"; // Make sure the path to LogOut.js is correct
import EmployerViewJobs from "./pages/EmployerPages/EmployerViewJobs";
import EmployerJobApplicantsPage from "./pages/EmployerPages/EmployerJobApplicantsPage";
import JobSeekerProfile from "./pages/DisplayProfilePage/JobSeekerProfile";
import EmployerProfile from "./pages/DisplayProfilePage/EmployerProfile";
import NotFoundPage from "./pages/NotFoundPage";
import { useAuth } from "./context/AuthContext";
import { JobSearchProvider } from "./context/JobSearchContext";
import JobDetails from "./pages/SearchJobs/JobDetails";
import AppliedJobs from "./pages/SearchJobs/AppliedJobs";
import SavedJobsPage from "./pages/SearchJobs/SavedJobs";
import SettingsPage from "./pages/SettingsPage";
import EmployerJobDetailsPage from "./pages/EmployerPages/EmployerJobDetailsPage";
import { EmployerJobProvider } from "./context/EmployerJobContext";
import { SpeedInsights } from "@vercel/speed-insights/react";

const App = () => {
  // Function to handle protected routes
  const ProtectedRoute = ({ allowedUserTypes, children }) => {
    const { currentUser, userType } = useAuth();

    if (!currentUser) {
      // User not logged in, redirect to login
      return <Navigate to="/login" />;
    } else if (!allowedUserTypes.includes(userType)) {
      // User is logged in but not allowed to access this route
      console.error(`Access denied. User type: ${userType} is not allowed.`);
      return <Navigate to={`/${userType}/home`} />;
    } else {
      // User is logged in and allowed to access this route
      return children;
    }
  };

  const RedirectToHome = () => {
    const { currentUser, userType } = useAuth();

    if (currentUser) {
      const homePath =
        userType === "employer" ? "/employer/home" : "/jobSeeker/home";
      return <Navigate to={homePath} replace />;
    }
    return <LandingPage />;
  };

  return (
    <Router>
      <Navbar />
      <Toaster />
      <SpeedInsights />
      <div className="App font-mono">
        <Routes>
          <Route path="/" element={<RedirectToHome />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<SignUpForm />} />
          <Route
            path="/employer/home"
            element={
              <ProtectedRoute allowedUserTypes={["employer"]}>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobSeeker/home"
            element={
              <ProtectedRoute allowedUserTypes={["jobSeeker"]}>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/manageprofile"
            element={
              <ProtectedRoute allowedUserTypes={["employer"]}>
                <EmployerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobseeker/manageprofile"
            element={
              <ProtectedRoute allowedUserTypes={["jobSeeker"]}>
                <JobSeekerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobSeeker/search-jobs"
            element={
              <ProtectedRoute allowedUserTypes={["jobSeeker"]}>
                <JobSearchProvider>
                  <SearchJob />
                </JobSearchProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="jobSeeker/search-jobs/:jobId"
            element={
              <ProtectedRoute allowedUserTypes={["jobSeeker"]}>
                <JobSearchProvider>
                  <JobDetails />
                </JobSearchProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="jobSeeker/applied-jobs"
            element={
              <ProtectedRoute allowedUserTypes={["jobSeeker"]}>
                <JobSearchProvider>
                  <AppliedJobs />
                </JobSearchProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="jobSeeker/applied-jobs/:jobId"
            element={
              <ProtectedRoute allowedUserTypes={["jobSeeker"]}>
                <JobSearchProvider>
                  <JobDetails />
                </JobSearchProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="jobSeeker/saved-jobs"
            element={
              <ProtectedRoute allowedUserTypes={["jobSeeker"]}>
                <JobSearchProvider>
                  <SavedJobsPage />
                </JobSearchProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="jobSeeker/saved-jobs/:jobId"
            element={
              <ProtectedRoute allowedUserTypes={["jobSeeker"]}>
                <JobSearchProvider>
                  <JobDetails />
                </JobSearchProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="employer/post-jobs"
            element={
              <ProtectedRoute allowedUserTypes={["employer"]}>
                <PostJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="employer/viewposted-jobs"
            element={
              <ProtectedRoute allowedUserTypes={["employer"]}>
                <EmployerJobProvider>
                  <EmployerViewJobs />
                </EmployerJobProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="employer/viewposted-jobs/:jobId"
            element={
              <ProtectedRoute allowedUserTypes={["employer"]}>
                <EmployerJobProvider>
                  <EmployerJobDetailsPage />
                </EmployerJobProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/viewposted-jobs/:jobId/applicants"
            element={
              <ProtectedRoute allowedUserTypes={["employer"]}>
                <EmployerJobProvider>
                  <EmployerJobApplicantsPage />
                </EmployerJobProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/:userType/settings"
            element={
              <ProtectedRoute allowedUserTypes={["jobSeeker", "employer"]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/viewjobs/id/applicants" element={<JobApplicants/>} /> */}
          <Route path="*" element={<NotFoundPage />} />;
          {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
