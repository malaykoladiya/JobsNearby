import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useJobSearch } from "../../context/JobSearchContext";
import httpClient from "../../utils/httpClient";
import { useEffect, useState } from "react";
import ApplyButtonModal from "../../components/JobSearchComponents/ApplyButtonModal";
import Spinner from "../../components/Spinner/Spinner";
import Confetti from "react-confetti";
import { toast } from "react-hot-toast";

const JobDetails = () => {
  const { jobs, toggleSaveJob, savedJobIDs, addAppliedJob, setJobs } =
    useJobSearch();

  const { jobId } = useParams(); // Retrieve the job ID from the URL
  const navigate = useNavigate();
  const location = useLocation();

  // New state for job details
  const [jobDetail, setJobDetail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  // State to track if the job has already been applied for
  const [hasApplied, setHasApplied] = useState(null);

  const API_JOB_DETAILS = `/user/job/${jobId}`;

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const response = await httpClient.get(API_JOB_DETAILS); // Replace with your actual API endpoint
        if (response.data) {
          setJobDetail(response.data);
          // Update the hasApplied state based on the applied_status from the response
          setHasApplied(response.data.applied_status);
        }
      } catch (error) {
        console.error("Error fetching job detail:", error);
        // Handle the error, perhaps navigate back or show an error message
      }
    };

    const jobFromContext = jobs.find((job) => job._id === jobId);
    if (jobFromContext) {
      // Use details from context if available
      setJobDetail(jobFromContext);
      setHasApplied(jobFromContext.applied_status);
    } else {
      // Fetch from server on page reload when context does not have the details
      fetchJobDetail();
    }
  }, [jobId, jobs]);

  const {
    companyName,
    reqId,
    jobTitle,
    jobCity,
    jobState,
    jobAdress,
    jobSalary,
    employmentType,
    noOfopening,
    jobDescription,
    jobSkills,
    companyDescription,
    companyIndustry,
    jobQualifications,
    startDate,
    appDeadline,
    createdAt,
    applied_status,
    under_review_status,
    rejected_status,
    accepted_status,
  } = jobDetail || {};

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  // Split the requirements by period into an array, filtering out any empty strings
  const qualificationsList = jobQualifications
    ? jobQualifications.split(". ").filter(Boolean)
    : [];

  const isJobSaved = savedJobIDs.has(jobId); // API Endpoint to apply for a job
  const API_APPLY_JOB = `/user/applyjobs/${jobId}`;

  // Call this function to start the confetti
  const startConfetti = () => {
    setShowConfetti(true);
  };

  // Call this function where you want to stop the confetti
  const stopConfetti = () => {
    const confettiStopTimeout = setTimeout(() => {
      // This will allow existing confetti pieces to fall out of the screen
      // but stop rendering new ones

      setShowConfetti(false);

      // Clear the timeout to avoid memory leaks
      clearTimeout(confettiStopTimeout);
    }, 5000);
  };

  // Function to handle applying to a job
  const handleApply = async () => {
    try {
      const response = await httpClient.post(API_APPLY_JOB);
      if (response.status === 200) {
        setHasApplied(true); // Set hasApplied to true on successful apply

        const newAppliedJob = {
          ...jobDetail,
          applied_status: response.data.applied_status,
        };
        addAppliedJob(newAppliedJob);

        // Update the applied_status in the jobs array
        const updatedJobs = jobs.map((job) =>
          job._id === jobId ? { ...job, applied_status: true } : job
        );
        setJobs(updatedJobs);

        handleCloseModal();

        // Wait for the modal to close before scrolling to top
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 300);

        // Start the confetti
        startConfetti();

        stopConfetti();

        toast.success(
          <span>
            You have successfully applied for <b>{jobTitle}</b> at{" "}
            <b>{companyName}</b>.
          </span>,
          {
            duration: 5000, // Duration the toast will stay on screen, in milliseconds
            position: "top-right",
            style: {
              fontSize: "16px",
              fontWeight: "500",
              borderRadius: "8px",
              padding: "16px",
              width: "auto",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            },
          }
        );
      } else {
        throw new Error(response.data.message || "Failed to apply for the job");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setHasApplied(true); // User has already applied, so set hasApplied to true
        toast.error(
          error.response.data.message ||
            "You have already applied for this job."
        );
      } else {
        // General error handling
        toast.error("Failed to apply for the job. Please try again.");
      }
      console.error("Error applying to job:", error.response || error);
    }
  };

  if (!jobDetail)
    return (
      <div>
        <Spinner />
      </div>
    );

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const ApplicationSteps = () => {
    // Determine the step class based on the current status
    const getStepClass = (step) => {
      if (accepted_status) {
        return "step-success"; // All steps turn green if accepted
      } else if (rejected_status) {
        if (
          step === "Applied" ||
          step === "Under Review" ||
          step === "Rejected"
        ) {
          return "step-error"; // Applied and Under Review turn yellow
        }
        return "";
      } else if (under_review_status) {
        if (step === "Applied" || step === "Under Review") {
          return "step-warning"; // Applied and Under Review turn yellow
        }
        return ""; // Other steps use default styling
      } else if (hasApplied) {
        if (step === "Applied") {
          return "step-neutral"; // Only Applied step turns primary
        }
        return ""; // Other steps use default styling
      }
      return ""; // Default case when none is applied
    };

    return (
      <div className="flex flex-col items-center w-full mt-16">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Your Application Status
        </h2>
        <div className="py-4">
          <ul className="steps steps-vertical md:steps-horizontal w-full">
            <li className={`step ${getStepClass("Applied")}`}>Applied</li>
            <li className={`step ${getStepClass("Under Review")}`}>
              Under Review
            </li>
            <li className={`step ${getStepClass("Rejected")}`}>Rejected</li>
            <li className={`step ${getStepClass("Accepted")}`}>Accepted</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mx-4 my-2 md:mx-8 md:my-4 lg:mx-12 lg:my-6">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          run={true} // This prop controls whether confetti is actively rendering
          recycle={false} // This prop controls whether to keep recycling the confetti pieces
          numberOfPieces={500}
        />
      )}
      <div className="px-4 py-5 sm:px-6 md:px-8 lg:px-10">
        {/* Header */}
        <h3 className="text-lg md:text-xl lg:text-2xl leading-6 font-medium text-gray-900">
          {jobTitle} at {companyName}
        </h3>
        <p className="mt-1 max-w-2xl text-sm md:text-base text-gray-500">
          {jobCity}, {jobState}
        </p>
      </div>
      {/* Salary, Job Type, Number of Opening, and Application Deadline */}
      <div className="container mx-auto px-4 py-5 sm:px-6 md:px-8 lg:px-10">
        {/* For small screens: 2x2 grid; for medium screens and up: single row */}
        <div className="grid grid-cols-2 gap-4 place-items-center md:flex md:flex-row md:justify-between">
          {/* Salary */}
          <div className="flex flex-col items-center justify-center bg-teal-200 text-black rounded-2xl w-5/6 h-16">
            <span className="text-sm font-medium">Salary</span>
            <span className="font-bold">{jobSalary}</span>
          </div>

          {/* Job Type */}
          <div className="flex flex-col items-center justify-center bg-sky-200 text-black rounded-2xl w-5/6 h-16">
            <span className="text-sm font-medium">Job Type</span>
            <span className="font-bold">{employmentType}</span>
          </div>

          {/* Number of Openings */}
          <div className="flex flex-col items-center justify-center bg-orange-200 text-black rounded-2xl w-5/6 h-16">
            <span className="text-sm font-medium">Number of Openings</span>
            <span className="font-bold">{noOfopening}</span>
          </div>

          {/* Application Deadline */}
          <div className="flex flex-col items-center justify-center bg-purple-200 text-black rounded-2xl w-5/6 h-16">
            <span className="text-sm font-medium">Application Deadline</span>
            <span className="font-bold">{formatDate(appDeadline)}</span>
          </div>
        </div>
        {jobDetail.applied_status && <ApplicationSteps />}
      </div>
      <div className="mt-5 border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl>
          {/* Job Description */}
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 md:px-8 lg:px-10">
            <dt className="text-sm md:text-base font-medium text-gray-500">
              Requisition ID
            </dt>
            <dd className="mt-1 text-sm md:text-base text-gray-900 sm:mt-0 sm:col-span-2">
              {reqId}
            </dd>
          </div>

          {/* Job Description */}
          <div className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 md:px-8 lg:px-10">
            <dt className="text-sm md:text-base font-medium text-gray-500">
              Job Description
            </dt>
            <dd className="mt-1 text-sm md:text-base text-gray-900 sm:mt-0 sm:col-span-2">
              {jobDescription}
            </dd>
          </div>

          {/* Requirements */}
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 md:px-8 lg:px-10">
            <dt className="text-sm md:text-base font-medium text-gray-500">
              Requirements
            </dt>
            <dd className="mt-1 text-sm md:text-base text-gray-900 sm:mt-0 col-span-2">
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {qualificationsList.map((qualification, index) => (
                  <li
                    key={index}
                    className="pl-3 px-4 py-3 flex items-center justify-between text-sm md:text-base"
                  >
                    <span className="w-0 flex-1 flex items-center">
                      <span className="ml-2 flex-1">{qualification}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>

          {/* Address */}
          <div className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 md:px-8 lg:px-10">
            <dt className="text-sm md:text-base font-medium text-gray-500">
              Address
            </dt>
            <dd className="mt-1 text-sm md:text-base text-gray-900 sm:mt-0 sm:col-span-2">
              {jobAdress}
            </dd>
          </div>

          {/* Skills */}
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 md:px-8 lg:px-10">
            <dt className="text-sm md:text-base font-medium text-gray-500">
              Skills
            </dt>
            <dd className="mt-1 text-sm md:text-base text-gray-900 sm:mt-0 sm:col-span-2">
              {jobSkills}
            </dd>
          </div>

          {/* Company Description */}
          <div className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 md:px-8 lg:px-10">
            <dt className="text-sm md:text-base font-medium text-gray-500">
              Company Description
            </dt>
            <dd className="mt-1 text-sm md:text-base text-gray-900 sm:mt-0 sm:col-span-2">
              {companyDescription}
            </dd>
          </div>

          {/* Company Industry */}
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 md:px-8 lg:px-10">
            <dt className="text-sm md:text-base font-medium text-gray-500">
              Company Industry
            </dt>
            <dd className="mt-1 text-sm md:text-base text-gray-900 sm:mt-0 sm:col-span-2">
              {companyIndustry}
            </dd>
          </div>

          {/* Dates and Actions */}
          <div className="bg-gray-100 px-4 py-5 sm:flex sm:items-center sm:justify-between sm:px-6 md:px-8 lg:px-10">
            <div className=" mr-4 sm:flex sm:gap-4">
              <dt className="text-sm  md:text-base font-medium text-gray-500">
                Starts on:
              </dt>
              <dd className="text-sm md:text-base font-bold text-gray-900 sm:mt-0">
                {formatDate(startDate)}
              </dd>
              <dt className="text-sm md:text-base font-medium text-gray-500">
                Posted on:
              </dt>
              <dd className="text-sm md:text-base font-bold text-gray-900 sm:mt-0">
                {formatDate(createdAt)}
              </dd>
            </div>
            <div className="mt-5 flex justify-end gap-4 px-4 py-5 sm:px-6 md:px-8 lg:px-10">
              <button
                className="btn btn-neutral btn-md md:btn-lg lg:btn-2xl"
                onClick={handleOpenModal}
                disabled={hasApplied} // Disable button if the user has applied
              >
                {hasApplied ? "Applied" : "One-Click Apply"}
              </button>
              <button
                onClick={() => toggleSaveJob(jobId)}
                className={`btn  btn-neutral btn-md md:btn-lg lg:btn-2xl`}
              >
                {isJobSaved ? "Unsave Job" : "Save Job"}
              </button>
            </div>
            <ApplyButtonModal
              isOpen={showModal}
              onClose={handleCloseModal}
              onConfirm={handleApply}
            />
          </div>
        </dl>
      </div>
    </div>
  );
};

export default JobDetails;
