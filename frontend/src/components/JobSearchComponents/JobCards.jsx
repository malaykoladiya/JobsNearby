import React, { useState } from "react";
import { FaBuilding } from "react-icons/fa";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useJobSearch } from "../../context/JobSearchContext";

const JobCard = ({ job, basePath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { savedJobIDs, toggleSaveJob, handleSelectJob } = useJobSearch();

  const handleClick = () => {
    handleSelectJob(job);
    navigate(`${basePath}/${job._id}`);
  };

  // Calculate the time since the job was posted
  const timePosted = new Date() - new Date(job.createdAt);
  const daysAgo = Math.floor(timePosted / (1000 * 60 * 60 * 24));
  const hoursAgo = Math.floor(timePosted / (1000 * 60 * 60));
  const minutesAgo = Math.floor(timePosted / (1000 * 60));

  let postedTimeLabel = "";
  if (daysAgo > 0) {
    postedTimeLabel = `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
  } else if (hoursAgo > 0) {
    postedTimeLabel = `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
  } else {
    postedTimeLabel = `${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`;
  }

  const cardClasses = `min-w-[300px] mb-2.5 cursor-pointer
    transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg space-y-4
    `;

  const handleSaveJob = async (e) => {
    e.stopPropagation(); // Prevent onSelectJob from firing
    await toggleSaveJob(job._id);
  };

  const isJobSaved = savedJobIDs.has(job._id);
  // Determine the logo to display
  const Logo = job.companyLogo ? (
    <img
      src={job.companyLogo}
      alt={`${job.companyName} Logo`}
      className="h-8 w-8"
    />
  ) : (
    <FaBuilding className="text-4xl" />
  );

  return (
    <div onClick={handleClick} className={cardClasses}>
      <div className="card shadow-xl h-full">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="avatar">
                <div className="w-12 rounded-full bg-blue-500 p-2">{Logo}</div>
              </div>
              <div className="flex-1">
                <h3 className="card-title">{job.jobTitle}</h3>
                <p className="text-base font-light text-gray-500">
                  {job.jobCity}, {job.jobState}
                </p>
              </div>
            </div>
            <button
              onClick={handleSaveJob}
              className="btn btn-circle btn-ghost hover:btn-primary"
            >
              {isJobSaved ? (
                <FaBookmark className="text-blue-500" />
              ) : (
                <FaRegBookmark className="text-blue-500" />
              )}
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="badge badge-lg bg-base-300">{job.jobSalary}</span>
            <span className="badge badge-lg bg-base-300">
              {job.employmentType}
            </span>
          </div>
          <div className="flex-auto">
            <p className="text-base font-normal text-gray-700 mb-4 line-clamp-2">
              {job.jobDescription}
            </p>
          </div>
          <div className="flex items-center justify-end text-base font-medium text-gray-500">
            <div className="flex-grow">
              {job.applied_status && (
                <span className="text-green-600">Applied</span>
              )}
            </div>
            <div className="flex-initial whitespace-nowrap">
              {postedTimeLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const JobCards = ({ jobs, basePath }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} basePath={basePath} />
      ))}
    </div>
  );
};

export default JobCards;
