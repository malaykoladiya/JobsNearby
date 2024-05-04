import { useNavigate } from "react-router-dom";
import EmployerJobCard from "../../components/EmployerJobComponents/EmployerJobCard";
import { useEmployerJob } from "../../context/EmployerJobContext";

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
        {jobs.map((job) => (
          <EmployerJobCard
            key={job._id}
            job={job}
            onSelectJob={handleJobSelect}
            isSelected={selectedJob && job._id === selectedJob._id}
          />
        ))}
      </aside>
    </div>
  );
};

export default EmployerViewJobs;
