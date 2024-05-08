import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const LandingPage = () => {
  const navigate = useNavigate();
  const { userType, setUserType } = useAuth();
  // const [userType, setUserType] = useState(null);

  const handleChange = (event) => {
    const selectedUserType = event.target.value;
    setUserType(selectedUserType);
    // setUserTypeContext(selectedUserType);
    localStorage.setItem("userType", selectedUserType);
    if (error) setError("");
  };

  const handleLogin = () => {
    if (!userType) {
      toast.error("Please select either Job Seeker or Employer to proceed.");
    } else {
      navigate("/login");
    }
  };

  const handleRegistration = () => {
    if (!userType) {
      toast.error("Please select either Job Seeker or Employer to proceed.");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-500 to bg-indigo-500 p-4">
      <div className="bg-white bg-opacity-10 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-5">Explore Opportunities</h1>
        <p className="text-lg font-medium mb-8">
          Connect with local businesses and job seekers in your community.
          Discover the right opportunities or talent near you.
        </p>

        {/* Display error message if needed */}
        <div className="flex justify-center gap-4 mb-8">
          <label className="flex items-center gap-2 text-lg cursor-pointer hover:scale-105 transition-transform">
            <input
              type="radio"
              value="jobSeeker"
              checked={userType === "jobSeeker"}
              onChange={handleChange}
              className="form-radio text-indigo-500 focus:ring-indigo-500"
            />
            Job Seeker
          </label>
          <label className="flex items-center gap-2 text-lg cursor-pointer hover:scale-105 transition-transform">
            <input
              type="radio"
              value="employer"
              checked={userType === "employer"}
              onChange={handleChange}
              className="form-radio text-indigo-500 focus:ring-indigo-500"
            />
            Employer
          </label>
        </div>
        <div className="flex justify-center gap-4">
          <button
            className="bg-white text-indigo-500 px-4 py-2 rounded-full hover:bg-transparent hover:text-white hover:border-2 hover:border-white transition-colors"
            onClick={handleLogin}
          >
            Login
          </button>
          <button
            className="bg-transparent text-white border-2 border-white px-4 py-2 rounded-full hover:bg-white hover:text-indigo-500 transition-colors"
            onClick={handleRegistration}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
