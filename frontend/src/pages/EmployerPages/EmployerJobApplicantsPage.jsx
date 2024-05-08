import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useEmployerJob } from "../../context/EmployerJobContext";
import httpClient from "../../utils/httpClient";
import Spinner from "../../components/Spinner/Spinner";
import { toast } from "react-hot-toast";
import { parseISO, formatDistanceToNow } from "date-fns";
import { toZonedTime } from "date-fns-tz";

import EmployerViewOfJobSeekerProfile from "../../components/EmployerJobComponents/EmployerViewOfJobSeekerProfile";

const EmployerJobApplicantsPage = () => {
  const { jobId } = useParams();
  const { jobs, handleSelectJob } = useEmployerJob();
  const [applicants, setApplicants] = useState([]);
  const [jobDetail, setJobDetail] = useState({});
  const [loading, setLoading] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [jobSeekerProfile, setJobSeekerProfile] = useState({});
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Function to fetch user profile details
  const fetchUserProfile = async (selectedUserId) => {
    try {
      const response = await httpClient.get(
        `/employer/user_profile/${selectedUserId}`
      );
      if (response.data && Object.keys(response.data).length !== 0) {
        setJobSeekerProfile(response.data);
        setIsProfileModalOpen(true);
      } else {
        console.error("Invalid or empty data received");
        toast.error("Empty user profile received.");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile.");
    }
  };

  const handleViewProfile = (userId) => {
    setSelectedUserId(userId);
    setJobSeekerProfile({}); // Optionally set to a loading state or clear data before fetching

    fetchUserProfile(userId);
  };

  // Function to render user profile modal using DaisyUI
  const renderUserProfileModal = () => {
    if (!jobSeekerProfile || Object.keys(jobSeekerProfile).length === 0) {
      return null; // Or render a loading spinner or placeholder
    }
    return (
      <div
        key={selectedUserId}
        className={`modal ${
          isProfileModalOpen ? "modal-open" : "modal-closed"
        }`} // Ensure that `modal-closed` hides the modal
        onClick={() => setIsProfileModalOpen(false)} // This will close the modal when you click outside
      >
        <div
          className="modal-box sm:max-w-2xl md:max-w-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <EmployerViewOfJobSeekerProfile profile={jobSeekerProfile} />

          <div className="modal-action">
            <button
              className="btn"
              onClick={() => setIsProfileModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Function to fetch applicants
  const fetchApplicants = async (jobId) => {
    try {
      const API_EMPLOYER_JOB_APPlICANTS = `/employer/job/${jobId}/applicants`;

      const response = await httpClient.get(API_EMPLOYER_JOB_APPlICANTS);
      setApplicants(response.data.applicants || []);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  // Function to fetch job details
  const fetchJobDetail = async () => {
    try {
      const response = await httpClient.get(`/employer/job/${jobId}`);
      const detail = response.data;
      setJobDetail(detail);
      handleSelectJob(detail);
      fetchApplicants(jobId);
    } catch (error) {
      console.error("Failed to fetch job details", error);
    }
  };

  useEffect(() => {
    const jobFromContext = jobs.find((job) => job._id === jobId);
    if (jobFromContext) {
      setJobDetail(jobFromContext);
      fetchApplicants(jobId);
    } else {
      fetchJobDetail();
    }
  }, [jobId]);

  useEffect(() => {
    if (jobDetail) {
      setLoading(false);
    }
  }, [jobDetail]);

  const formatAppliedOn = useMemo(() => {
    return (dateString) => {
      const utcDate = parseISO(dateString + "Z");
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const zonedDate = toZonedTime(utcDate, userTimezone);
      return formatDistanceToNow(zonedDate, {
        addSuffix: true,
        includeSeconds: true,
      });
    };
  }, []);

  const formatDate = useMemo(() => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return (dateString) => {
      return new Date(dateString).toLocaleDateString(undefined, options);
    };
  }, []);

  // Destructure all necessary fields from job object
  const {
    jobTitle,
    companyName,
    jobCity,
    jobState,
    jobSalary,
    employmentType,
    noOfopening,
    appDeadline,
  } = jobDetail;

  if (loading) {
    return <Spinner />;
  }

  //Handle Status Change

  const handleStatusChange = async (application_id, newStatus) => {
    try {
      // Send the request to the server and wait for the response
      const response = await httpClient.put(
        `/employer/applicant/${application_id}/status`,
        { status: newStatus }
      );

      // Check the server response for success
      if (response.data.success) {
        // Update the UI only if the server indicates success
        const updatedApplicants = applicants.map((applicant) => {
          if (applicant.application_id === application_id) {
            return { ...applicant, status: newStatus };
          }
          return applicant;
        });

        setApplicants(updatedApplicants); // Update the state with the new list
        toast.success("Status updated successfully!");
      } else {
        // Handle cases where the server did not process the request successfully
        console.error(
          "Server failed to update the applicant status:",
          response.data.message
        );
        toast.error("Failed to update status: " + response.data.message);
      }
    } catch (error) {
      console.error("Error updating applicant status:", error);
      toast.error("Error updating status: " + error.message);
    }
  };

  // Function to render applicants list or a message if there are no applicants
  const renderApplicantsList = () => {
    if (applicants.length === 0) {
      return (
        <div className="text-center py-5">
          <span className="alert flex justify-center">
            No applicants have applied for this job yet.
          </span>
        </div>
      );
    }

    return (
      <div className="rounded-md bg-white shadow-xs overflow-hidden">
        <ul>
          {applicants.map((applicant) => (
            <li
              key={applicant.application_id}
              className="transition duration-300 ease-in-out hover:bg-gray-50 hover:shadow-lg rounded-md py-4"
            >
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex-1">
                  <h1 className=" text-xl font-medium">{applicant.name}</h1>
                  <p className="text-sm text-gray-500">
                    Email: {applicant.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    Phone: {applicant.phone}
                  </p>
                  <p className="text-sm text-gray-500">
                    Location: {applicant.location}
                  </p>{" "}
                  {/* Location */}
                  <p className="text-sm text-gray-500">
                    Applied: {formatAppliedOn(applicant.applied_on)}
                  </p>
                  {/* Applied On, relative time */}
                </div>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    applicant.status === "accepted"
                      ? "bg-green-100 text-green-800"
                      : applicant.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : applicant.status === "under_review"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {applicant.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <div className="flex gap-4 mt-3  justify-center">
                <button
                  className="btn btn-sm btn-outline hover:bg-neutral hover:border-transparent hover:shadow-lg hover:text-white transition-all duration-300"
                  onClick={() => handleViewProfile(applicant.user_id)}
                >
                  View Profile
                </button>
                <button
                  className="btn btn-sm btn-outline hover:bg-neutral hover:border-transparent hover:shadow-lg hover:text-white transition-all duration-300"
                  onClick={() =>
                    handleStatusChange(applicant.application_id, "under_review")
                  }
                >
                  Under Review
                </button>
                <button
                  className="btn btn-sm btn-outline hover:bg-neutral hover:border-transparent hover:shadow-lg hover:text-white transition-all duration-300"
                  onClick={() =>
                    handleStatusChange(applicant.application_id, "rejected")
                  }
                >
                  Reject
                </button>
                <button
                  className="btn btn-sm btn-outline hover:bg-neutral hover:border-transparent hover:shadow-lg hover:text-white transition-all duration-300"
                  onClick={() =>
                    handleStatusChange(applicant.application_id, "accepted")
                  }
                >
                  Accept
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-w-[450px] bg-white shadow overflow-hidden sm:rounded-lg mx-4 my-6 md:mx-8 md:my-4 lg:mx-12 lg:my-6">
      <h2 className="text-2xl mt-5 flex justify-center font-semibold mb-4">
        Job Applicants
      </h2>
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
      <div className="mt-28 mb-5 flex justify-center font-semibold text-xl">
        <h1>List of Applicants </h1>
      </div>

      <div className="mb-10 bg-white overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">{renderApplicantsList()}</ul>
      </div>
      {renderUserProfileModal()}
    </div>
  );
};

export default EmployerJobApplicantsPage;
