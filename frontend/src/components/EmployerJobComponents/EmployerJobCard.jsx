import React from "react";
import { FaBriefcase, FaRegClock } from "react-icons/fa";

const EmployerJobCard = ({ job, onSelectJob, isSelected }) => {
  const {
    jobTitle,
    jobCity,
    jobState,
    jobSalary,
    employmentType,
    createdAt,
    jobDescription,
  } = job;

  // Calculate the time since the job was posted
  const timePosted = new Date() - new Date(createdAt);
  const daysAgo = Math.floor(timePosted / (1000 * 60 * 60 * 24));
  let postedTimeLabel =
    daysAgo > 0 ? `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago` : "Today";

  return (
    <div
      className={`card bg-white min-w-[300px] rounded-lg shadow-md border mb-6 transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
        isSelected ? "border-blue-500 bg-blue-200" : "border-transparent"
      }`}
      onClick={() => onSelectJob(job)}
    >
      <div className="card-body p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="avatar placeholder">
              <div className="bg-blue-500 text-white rounded-full w-10 h-10">
                <FaBriefcase size={24} />
              </div>
            </div>
            <div>
              <h2 className="card-title text-lg md:text-xl">{jobTitle}</h2>
              <p className="text-sm md:text-base text-gray-500">{`${jobCity}, ${jobState}`}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="badge badge-outline badge-lg text-xs md:text-sm">
            {employmentType}
          </div>
          <div className="badge badge-outline badge-lg text-xs md:text-sm">
            {jobSalary}
          </div>
        </div>
        <p className="text-sm md:text-base text-gray-700 my-2 line-clamp-2">
          {jobDescription}
        </p>
        <div className="flex justify-end">
          <div className="text-gray-600 text-xs md:text-sm">
            <FaRegClock className="inline mr-1" />
            {postedTimeLabel}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerJobCard;
