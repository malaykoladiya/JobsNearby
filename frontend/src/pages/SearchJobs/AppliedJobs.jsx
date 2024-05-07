import React from "react";
import { useJobSearch } from "../../context/JobSearchContext";
import JobCards from "../../components/JobSearchComponents/JobCards";
import Spinner from "../../components/Spinner/Spinner";

const AppliedJobs = () => {
  const { appliedJobs, setSelectedJob, isLoading } = useJobSearch();

  const handleSelectJob = (job) => {
    setSelectedJob(job);
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-5 font-sans overflow-hidden">
      <h1 className="text-2xl font-bold mb-6 text-center">Applied Jobs</h1>
      <div className="mt-5">
        {appliedJobs.length > 0 ? (
          <JobCards jobs={appliedJobs} basePath="/jobSeeker/applied-jobs" />
        ) : (
          <p className="text-center my-auto text-gray-600">
            No applied jobs found.
          </p>
        )}
      </div>
    </div>
  );
};

export default AppliedJobs;
