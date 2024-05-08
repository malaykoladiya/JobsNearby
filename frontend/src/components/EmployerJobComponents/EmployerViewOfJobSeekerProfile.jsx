import React from "react";
import { FaUniversity, FaBuilding } from "react-icons/fa";
import { AiOutlineMail, AiOutlinePhone, AiOutlineHome } from "react-icons/ai";

const EmployerViewOfJobSeekerProfile = ({ profile }) => {
  const renderProfileImageOrInitials = () => {
    if (profile.imageUrl) {
      return (
        <img
          className="rounded-full w-24 h-24 object-cover"
          src={profile.imageUrl}
          alt="Profile"
        />
      );
    } else {
      const initials = `${profile.jobSeekerFirstName[0] || ""}${
        profile.jobSeekerLastName[0] || ""
      }`;
      return (
        <div className="avatar-placeholder rounded-full w-24 h-24 bg-blue-500 text-white flex items-center justify-center text-3xl font-semibold">
          {initials.toUpperCase()}
        </div>
      );
    }
  };

  return (
    <div className="card bg-base-100 min-w-[300px]">
      <div className="card-body items-center text-center">
        {renderProfileImageOrInitials()}
        <h2 className="card-title">
          {profile.jobSeekerFirstName} {profile.jobSeekerLastName}
        </h2>
        <p>{profile.jobSeekerRole}</p>
        <div>
          <p className="flex items-center justify-left">
            <AiOutlineMail size={20} className="mr-2" />
            {profile.jobSeekerEmail}
          </p>
          <p className="flex items-center justify-left">
            <AiOutlinePhone size={20} className="mr-2" />
            {profile.jobSeekerPhoneNumber}
          </p>
          <p className="flex items-center justify-left">
            <AiOutlineHome size={20} className="mr-2" />
            {profile.jobSeekerLocation}
          </p>
        </div>
      </div>
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Education</h2>
        {profile.jobSeekerEducation.length === 0 ? (
          <div className="text-gray-500 text-center my-10">
            No Education Information Available
          </div>
        ) : (
          profile.jobSeekerEducation.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex items-start">
                <div className="mr-8 mt-3 md:mr-10 lg:mt-3">
                  <FaUniversity size={40} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {edu.jobSeekerEduSchoolName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {edu.jobSeekerEduDegreeType} in {edu.jobSeekerEduMajor},
                    GPA: {edu.jobSeekerEduGPA}
                  </p>
                  <p className="text-sm text-gray-600">
                    {edu.jobSeekerEduStartYear} -{" "}
                    {edu.jobSeekerEduEndYear || "Present"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Work Experience</h2>
        {profile.jobSeekerWorkExperience.length === 0 ? (
          <div className="text-gray-500 text-center my-10">
            No Work Experience Information Available
          </div>
        ) : (
          profile.jobSeekerWorkExperience.map((experience, index) => (
            <div key={index} className="mb-4">
              <div className="flex items-start">
                <FaBuilding
                  size={40}
                  className="mr-8 mt-3 md:mr-10 lg:mt-3 text-xl"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {experience.jobSeekerWorkExPosition}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {experience.jobSeekerWorkExCompany} •{" "}
                    {experience.jobSeekerWorkExLocation}
                  </p>
                  <p className="text-sm text-gray-600">
                    {experience.jobSeekerWorkExStartMonth}{" "}
                    {experience.jobSeekerWorkExStartYear} -{" "}
                    {experience.endYear
                      ? `${experience.jobSeekerWorkExEndMonth} ${experience.jobSeekerWorkExEndYear}`
                      : "Present"}
                  </p>
                  <ul className="mt-2 list-disc list-inside">
                    {experience.jobSeekerWorkExDescription
                      .split("\n")
                      .map((line, lineIndex) => (
                        <li key={lineIndex} className="text-gray-600">
                          {line}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployerViewOfJobSeekerProfile;
