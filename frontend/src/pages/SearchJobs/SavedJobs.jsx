import React, { Suspense, lazy } from "react";
import { useJobSearch } from "../../context/JobSearchContext";
import Spinner from "../../components/Spinner/Spinner";
const JobCards = lazy(() =>
  import("../../components/JobSearchComponents/JobCards")
);

const SavedJobsPage = () => {
  const { savedJobData, setSelectedJob, isLoading } = useJobSearch();

  const handleSelectJob = (job) => {
    setSelectedJob(job);
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-5 font-sans overflow-hidden">
      <h1 className="text-2xl font-bold mb-6 text-center">Saved Jobs</h1>
      <div className="mt-5">
        {savedJobData.length > 0 ? (
          <Suspense fallback={<Spinner />}>
            <JobCards jobs={savedJobData} basePath="/jobSeeker/saved-jobs" />
          </Suspense>
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
