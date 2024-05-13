import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import httpClient from "../../utils/httpClient";
import { useEmployerJob } from "../../context/EmployerJobContext";
import Spinner from "../../components/Spinner/Spinner";
const EmployerJobForm = lazy(() =>
  import("../../components/EmployerJobComponents/EmployerJobForm")
);

const EmployerJobDetailsPage = () => {
  const { jobs, selectedJob, handleSelectJob, setJobs } = useEmployerJob();
  const [jobDetail, setJobDetail] = useState(selectedJob);

  const { jobId } = useParams(); // Retrieve the job ID from the URL

  const API_EMPLOYER_JOB_DETAILS = `/employer/job/${jobId}`;

  const employerFetchJobDetail = useCallback(async () => {
    try {
      const response = await httpClient.get(API_EMPLOYER_JOB_DETAILS);
      if (response.data) {
        setJobDetail(response.data.job);
      }
    } catch (error) {
      console.error("Failed to fetch job details", error);
    }
  }, [API_EMPLOYER_JOB_DETAILS]);

  useEffect(() => {
    const jobFromContext = jobs.find((job) => job._id === jobId);

    if (!jobFromContext) {
      // Only fetch job details if the job is not in the context
      employerFetchJobDetail();
    } else {
      setJobDetail(jobFromContext);
    }
  }, [jobs, jobId, employerFetchJobDetail]);

  // Destructure all necessary fields from job object
  const {
    jobTitle,
    reqId,
    companyName,
    jobCity,
    jobState,
    jobSalary,
    employmentType,
    noOfopening,
    appDeadline,
    jobDescription,
    jobQualifications,
    jobAdress,
    jobSkills,
    companyDescription,
    companyIndustry,
    startDate,
    createdAt,
  } = jobDetail || {};

  // Edit Modal Code

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = useCallback((jobDetail) => {
    setIsModalOpen(true);
    handleSelectJob(jobDetail);
  }, []);

  const handleFormSubmit = async (formData) => {
    try {
      // Construct the URL with the job ID
      const jobUpdateUrl = `/employer/updatejob/${selectedJob._id}`;

      // Make the PATCH request with the formData
      const response = await httpClient.patch(jobUpdateUrl, formData);
      if (response.data && response.data.job) {
        toast.success(response.data.message || "Job updated successfully!");

        // Update the selectedJob in the context
        handleSelectJob(response.data.job);
        setJobDetail(response.data.job);

        // Update the jobs array in the context
        const updatedJobs = jobs.map((job) =>
          job._id === response.data.job._id ? response.data.job : job
        );
        setJobs(updatedJobs);

        // Also update the session storage
        sessionStorage.setItem(
          "employerPostedJobs",
          JSON.stringify(updatedJobs)
        );

        // Close the modal
        setIsModalOpen(false);

        // Optional: Refresh the job details or trigger a re-render/update state
        // fetchJobDetails(formData.jobId);
      } else {
        // Handle the case where the job data is not returned
        throw new Error("No job data returned from the server.");
      }
    } catch (error) {
      // Extracting the error message from the response
      const errorMessage =
        error.response?.data?.error ||
        error.message || // This will catch more generic error messages
        "An error occurred while updating the job";
      toast.error(errorMessage);

      console.error("Update Error:", errorMessage);
    }
  };

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleModalClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  // code for delete functionality

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const handleDelete = (job) => {
    setIsDeleteModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const navigate = useNavigate();

  const confirmDelete = useCallback(async () => {
    try {
      const deleteUrl = `/employer/deletejob/${jobDetail._id}`;
      const response = await httpClient.delete(deleteUrl);

      if (response.status === 200) {
        toast.success(response.data.message || "Job deleted successfully!");

        // Update the local state or context here, remove the job from the jobs array
        const updatedJobs = jobs.filter((job) => job._id !== jobDetail._id);
        // Call the function to update the jobs in the context if necessary
        setJobs(updatedJobs);
        sessionStorage.setItem(
          "employerPostedJobs",
          JSON.stringify(updatedJobs)
        );

        // Redirect or update UI
        navigate("/employer/viewposted-jobs"); // Adjusted the path to match your desired route
      } else {
        // Handle different errors based on the status code
        const errorMessage =
          response.data.error || "Unexpected error occurred.";
        toast.error(errorMessage);
      }
    } catch (error) {
      // This will catch network errors or cases where the server response could not be processed
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Network error or bad response";
      toast.error(errorMessage);
    } finally {
      setIsDeleteModalOpen(false); // Close the modal in any case
    }
  }, [jobs, jobDetail, navigate]);

  // View Applicants Code
  const handleViewApplicants = () => {
    navigate(`/employer/viewposted-jobs/${jobId}/applicants`);
  };

  const formatDate = useMemo(() => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return (dateString) => {
      return new Date(dateString).toLocaleDateString(undefined, options);
    };
  }, []);

  // Split the requirements by period into an array, filtering out any empty strings
  const qualificationsList = jobQualifications
    ? jobQualifications.split(". ").filter(Boolean)
    : [];

  return (
    <div className="min-w-[450px] bg-white shadow overflow-hidden sm:rounded-lg mx-4 my-6 md:mx-8 md:my-4 lg:mx-12 lg:my-6">
      <div className="px-4 py-5 sm:px-6 md:px-8 lg:px-10">
        <h3 className="text-lg md:text-xl lg:text-2xl leading-6 font-medium text-gray-900">
          {jobTitle} at {companyName}
        </h3>
        <p className="mt-1 max-w-2xl text-sm md:text-base text-gray-500">
          {jobCity}, {jobState}
        </p>
      </div>
      {/* Salary, Job Type, Number of Opening, and Application Deadline */}
      <div className="container mx-auto px-4 py-5 sm:px-6 md:px-8 lg:px-10 space-y-1 md:space-y-2 lg:space-y-3 lg:my-4">
        {/* For small screens: 2x2 grid; for medium screens and up: single row */}
        <div className="grid grid-cols-2 gap-4 place-items-center md:flex md:flex-row md:justify-between">
          {/* Salary */}
          <div className="flex flex-col items-center justify-center bg-teal-200 text-black rounded-2xl w-5/6 h-16">
            <span className="text-sm font-medium">Salary</span>
            <span className="text-sm sm:text-md md:text-lg font-bold">
              {jobSalary}
            </span>
          </div>

          {/* Job Type */}
          <div className="flex flex-col items-center justify-center bg-sky-200 text-black rounded-2xl w-5/6 h-16">
            <span className="text-sm font-medium">Job Type</span>
            <span className="text-sm sm:text-md md:text-lg font-bold">
              {employmentType}
            </span>
          </div>

          {/* Number of Openings */}
          <div className="flex flex-col items-center justify-center bg-orange-200 text-black rounded-2xl w-5/6 h-16">
            <span className="text-sm font-medium">Number of Openings</span>
            <span className="text-sm sm:text-md md:text-lg font-bold">
              {noOfopening}
            </span>
          </div>

          {/* Application Deadline */}
          <div className="flex flex-col items-center justify-center bg-purple-200 text-black rounded-2xl w-5/6 h-16">
            <span className="text-sm font-medium">Application Deadline</span>
            <span className=" text-sm sm:text-md md:text-lg font-bold">
              {formatDate(appDeadline)}
            </span>
          </div>
        </div>
      </div>

      {/* Req Id */}
      <div className="px-4 py-5 sm:px-6 md:px-8 lg:px-10 space-y-1 md:space-y-2 lg:space-y-3 lg:my-4">
        <h3 className="text-lg md:text-xl lg:text-2xl leading-6 font-semibold text-gray-900">
          Requisition ID
        </h3>
        <p className="mt-8 text-sm md:text-md lg:text-lg text-gray-900 sm:mt-0">
          {reqId}
        </p>
      </div>

      {/* Job Description */}
      <div className="px-4 py-5 sm:px-6 md:px-8 lg:px-10 space-y-1 md:space-y-2 lg:space-y-3 lg:my-4">
        <h3 className="text-lg md:text-xl lg:text-2xl leading-6 font-semibold text-gray-900">
          Description
        </h3>
        <p className="mt-8 text-sm md:text-md lg:text-lg text-gray-900 sm:mt-0 col-span-2">
          {jobDescription}
        </p>
      </div>

      {/* Requirements */}
      <div className="px-4 py-5 sm:px-6 md:px-8 lg:px-10 space-y-1 md:space-y-2 lg:space-y-3 lg:my-4">
        <h3 className="text-lg md:text-xl lg:text-2xl leading-6 font-semibold text-gray-900">
          Job Requirement
        </h3>
        <ul className="list-disc pl-5">
          {qualificationsList.map((qualification, index) => (
            <li
              key={index}
              className="mt-1 text-sm md:text-md lg:text-lg text-gray-900"
            >
              {qualification}
            </li>
          ))}
        </ul>
      </div>

      {/* Skills */}
      <div className="px-4 py-5 sm:px-6 md:px-8 lg:px-10 space-y-1 md:space-y-2 lg:space-y-3 lg:my-4">
        <h3 className="text-lg md:text-xl lg:text-2xl leading-6 font-semibold text-gray-900">
          Skills
        </h3>
        <p className="mt-1 text-sm md:text-md lg:text-lg text-gray-900 col-span-2">
          {jobSkills}
        </p>
      </div>

      {/* Company Description */}
      <div className="px-4 py-5 sm:px-6 md:px-8 lg:px-10 space-y-1 md:space-y-2 lg:space-y-3 lg:my-4">
        <h3 className="text-lg md:text-xl lg:text-2xl leading-6 font-semibold text-gray-900">
          Company Description
        </h3>
        <p className="mt-1 text-sm md:text-md lg:text-lg text-gray-900 col-span-2">
          {companyDescription}
        </p>
      </div>

      {/* Company Industry */}
      <div className="px-4 py-5 sm:px-6 md:px-8 lg:px-10 space-y-1 md:space-y-2 lg:space-y-3 lg:my-4">
        <h3 className="text-lg md:text-xl lg:text-2xl leading-6 font-semibold text-gray-900">
          Company Industry
        </h3>
        <p className="mt-1 max-w-2xl text-sm md:text-md lg:text-lg text-gray-900">
          {companyIndustry}
        </p>
      </div>

      {/* Address */}
      <div className="px-4 py-5 sm:px-6 md:px-8 lg:px-10 space-y-1 md:space-y-2 lg:space-y-3 lg:my-4">
        <h3 className="text-lg md:text-xl lg:text-2xl leading-6 font-semibold text-gray-900">
          Address
        </h3>
        <p className="mt-1 max-w-2xl text-sm md:text-md lg:text-lg text-gray-900">
          {jobAdress}
        </p>
      </div>

      {/* Start Date and Created At */}
      <div className="px-4 py-5 sm:flex sm:items-center sm:justify-between sm:px-6 md:px-8 lg:px-10 space-y-1 md:space-y-2 lg:space-y-3 lg:my-4">
        <div className="flex items-center space-x-4">
          <p className="text-md md:text-lg lg:text-xl font-bold text-gray-900">
            Starts on:{" "}
            <span className="font-medium text-gray-900">
              {formatDate(startDate)}
            </span>
          </p>
          <p className="text-md md:text-lg lg:text-xl font-bold text-gray-900">
            Posted on:{" "}
            <span className="font-medium text-gray-900">
              {formatDate(createdAt)}
            </span>
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-4 px-4 py-5 sm:px-6 md:px-8 lg:px-10">
        <button
          className="btn w-32 h-10 sm:w-40 sm:h-14 sm:text-md bg-neutral hover:bg-neutral-focus text-white py-2 px-4 rounded-xl"
          onClick={() => handleEdit(jobDetail)}
        >
          Edit
        </button>
        <button
          className="btn w-32 h-10 sm:w-40 sm:h-14 sm:text-md bg-neutral hover:bg-neutral-focus text-white py-2 px-4 rounded-xl"
          onClick={() => handleDelete(jobDetail)}
        >
          Delete
        </button>
        <button
          className="btn w-32 h-10 sm:w-40 sm:h-14 sm:text-md bg-neutral hover:bg-neutral-focus text-white py-2 px-4 rounded-xl"
          onClick={handleViewApplicants}
        >
          View Applicants
        </button>
      </div>

      {/* Modal for editing job details */}
      {isModalOpen && (
        <div className="modal modal-open" onClick={handleClose}>
          <div
            className="modal-box relative max-w-none w-[90%] sm:w-3/4 md:w-3/4 lg:w-4/5 xl:w-3/4"
            onClick={handleModalClick}
          >
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={handleClose}
            >
              ✕
            </button>
            <h3 className="mt-10 font-bold text-2xl text-center">
              Edit Job Details
            </h3>
            <Suspense fallback={<Spinner />}>
              <EmployerJobForm job={selectedJob} onSubmit={handleFormSubmit} />
            </Suspense>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div
          className="modal modal-open"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">
              Are you sure you want to delete this job?
            </h3>
            <div className="modal-action">
              <button className="btn" onClick={confirmDelete}>
                Confirm
              </button>
              <button className="btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerJobDetailsPage;
