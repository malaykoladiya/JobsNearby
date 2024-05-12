import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
  Link,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";
import { JobSearchProvider } from "./context/JobSearchContext";
import { EmployerJobProvider } from "./context/EmployerJobContext";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import Spinner from "./components/Spinner/Spinner";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginForm = lazy(() => import("./pages/Login"));
const SignUpForm = lazy(() => import("./pages/SignUpForm"));
const HomePage = lazy(() => import("./pages/HomePage"));
const SearchJob = lazy(() => import("./pages/SearchJobs/SearchJobs"));
const PostJobPage = lazy(() => import("./pages/EmployerPages/PostJobPage"));
const EmployerViewJobs = lazy(() =>
  import("./pages/EmployerPages/EmployerViewJobs")
);
const EmployerJobApplicantsPage = lazy(() =>
  import("./pages/EmployerPages/EmployerJobApplicantsPage")
);
const JobSeekerProfile = lazy(() =>
  import("./pages/DisplayProfilePage/JobSeekerProfile")
);
const EmployerProfile = lazy(() =>
  import("./pages/DisplayProfilePage/EmployerProfile")
);
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const JobDetails = lazy(() => import("./pages/SearchJobs/JobDetails"));
const AppliedJobs = lazy(() => import("./pages/SearchJobs/AppliedJobs"));
const SavedJobsPage = lazy(() => import("./pages/SearchJobs/SavedJobs"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const EmployerJobDetailsPage = lazy(() =>
  import("./pages/EmployerPages/EmployerJobDetailsPage")
);

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
      <Analytics />
      <div className="App font-mono">
        <Suspense fallback={<Spinner />}>
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
        </Suspense>
      </div>
    </Router>
  );
};

export default App;
