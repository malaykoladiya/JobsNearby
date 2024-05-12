import React, { Suspense, lazy } from "react";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/Spinner/Spinner";

const ProfilePersonalInfoCard = lazy(() =>
  import("../../components/ProfileManagementComponents/ProfilePersonalInfoCard")
);
const ProfileWorkExCard = lazy(() =>
  import("../../components/ProfileManagementComponents/ProfileWorkExCard")
);
const ProfileEduCard = lazy(() =>
  import("../../components/ProfileManagementComponents/ProfileEduCard")
);

const EmployerProfile = () => {
  const { profile, loading } = useAuth(); // Use profile and loading from AuthContext

  if (loading || !profile) {
    return <Spinner />; // Use Spinner when loading or profile is not available
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col lg:flex-row justify-center lg:space-x-4 px-4 lg:px-8">
      <div className="flex-grow sm:w-2/3 sm:mx-auto md:w-3/4 md:mx-auto lg:w-1/3 mb-4 lg:mb-0 ">
        {/* This will be full width on small screens and 1/3 on large screens */}
        <Suspense fallback={<Spinner />}>
          <ProfilePersonalInfoCard profile={profile} />
        </Suspense>
      </div>
      <div className="flex-grow sm:w-2/3 sm:mx-auto md:w-3/4 md:mx-auto lg:w-2/3 space-y-4">
        {/* This will also be full width on small screens and 2/3 on large screens */}
        <Suspense fallback={<Spinner />}>
          <ProfileWorkExCard workExperience={profile.employerWorkExperience} />
        </Suspense>

        {/* Place the EducationCard component here when ready */}
        <Suspense fallback={<Spinner />}>
          <ProfileEduCard education={profile.employerEducation} />
        </Suspense>

        {/* <EducationCard education={profile.education} /> */}
      </div>
    </div>
  );
};

export default EmployerProfile;
