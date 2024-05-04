import React from "react";
import { useJobSearch } from "../../context/JobSearchContext";
import JobCards from "../../components/JobSearchComponents/JobCards";

const SavedJobsPage = () => {
  const { savedJobData, setSelectedJob } = useJobSearch();

  console.log("saved jobs in savedJobs.jsx", savedJobData);
  const handleSelectJob = (job) => {
    setSelectedJob(job);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-5 font-sans overflow-hidden">
      <h1 className="text-2xl font-bold mb-6 text-center">Saved Jobs</h1>
      <div className="mt-5">
        {savedJobData.length > 0 ? (
          <JobCards jobs={savedJobData} basePath="/jobSeeker/saved-jobs" />
        ) : (
          <p className="text-center my-auto text-gray-600">
            No saved jobs found.
          </p>
        )}
      </div>
    </div>
  );
};

export default SavedJobsPage;
