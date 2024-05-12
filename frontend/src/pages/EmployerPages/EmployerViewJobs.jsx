import React, { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployerJob } from "../../context/EmployerJobContext";
import Spinner from "../../components/Spinner/Spinner";
const EmployerJobCard = lazy(() =>
  import("../../components/EmployerJobComponents/EmployerJobCard")
);

const EmployerViewJobs = () => {
  const { jobs, selectedJob, handleSelectJob } = useEmployerJob();
  const navigate = useNavigate();

  const handleJobSelect = (job) => {
    handleSelectJob(job);
    navigate(`/employer/viewposted-jobs/${job._id}`, { state: { job } });
  };

  return (
    <div className="flex flex-wrap md:flex-nowrap m-5 gap-4">
      {/* Left Column for Job Cards */}
      <aside className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="col-span-full text-center text-xl font-semibold bg-blue-100 p-4 rounded-md shadow-md">
          Your Posted Jobs
        </div>
        <Suspense fallback={<Spinner />}>
          {jobs.map((job) => (
            <EmployerJobCard
              key={job._id}
              job={job}
              onSelectJob={handleJobSelect}
              isSelected={selectedJob && job._id === selectedJob._id}
            />
          ))}
        </Suspense>
      </aside>
    </div>
  );
};

export default EmployerViewJobs;
