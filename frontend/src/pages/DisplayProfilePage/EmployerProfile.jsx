import React from "react";
import { useAuth } from "../../context/AuthContext";
import ProfilePersonalInfoCard from "../../components/ProfileManagementComponents/ProfilePersonalInfoCard";
import ProfileWorkExCard from "../../components/ProfileManagementComponents/ProfileWorkExCard";
import ProfileEduCard from "../../components/ProfileManagementComponents/ProfileEduCard";

const EmployerProfile = () => {
  const { profile, loading } = useAuth(); // Use profile and loading from AuthContext

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Loading...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col lg:flex-row justify-center lg:space-x-4 px-4 lg:px-8">
      <div className="flex-grow sm:w-2/3 sm:mx-auto md:w-3/4 md:mx-auto lg:w-1/3 mb-4 lg:mb-0 ">
        {/* This will be full width on small screens and 1/3 on large screens */}
        <ProfilePersonalInfoCard profile={profile} />
      </div>
      <div className="flex-grow sm:w-2/3 sm:mx-auto md:w-3/4 md:mx-auto lg:w-2/3 space-y-4">
        {/* This will also be full width on small screens and 2/3 on large screens */}
        <ProfileWorkExCard workExperience={profile.employerWorkExperience} />
        {/* Place the EducationCard component here when ready */}
        <ProfileEduCard education={profile.employerEducation} />
        {/* <EducationCard education={profile.education} /> */}
      </div>
    </div>
  );
};

export default EmployerProfile;
