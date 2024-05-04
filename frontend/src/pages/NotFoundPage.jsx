import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NotFoundPage = () => {
  const { userType } = useAuth();

  // Construct the home page route based on userType
  const homeRoute =
    userType === "employer" ? "/employer/home" : "/jobSeeker/home";

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-3">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to={homeRoute} // Use the dynamically determined route
        className="mt-6 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-200"
      >
        ← Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
