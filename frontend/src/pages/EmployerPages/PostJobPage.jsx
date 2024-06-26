// pages/PostJobPage.js

import React, { Suspense, lazy } from "react";
import httpClient from "../../utils/httpClient";
import { toast } from "react-hot-toast";
import Spinner from "../../components/Spinner/Spinner";
const EmployerJobForm = lazy(() =>
  import("../../components/EmployerJobComponents/EmployerJobForm")
);

function PostJobPage() {
  const API_URL = "/employer/postjob";

  const handleCreateJob = async (formData, { resetForm }) => {
    // Make a POST request to create a new job with the formData
    try {
      const response = await httpClient.post(API_URL, formData);
      if (response.data && response.data.newJob) {
        toast.success(response.data.message || "Job posted successfully!");

        // Update the session storage with the new job data returned from the server
        const existingJobs =
          JSON.parse(sessionStorage.getItem("employerPostedJobs")) || [];
        const updatedJobs = [...existingJobs, response.data.newJob];
        sessionStorage.setItem(
          "employerPostedJobs",
          JSON.stringify(updatedJobs)
        );

        resetForm(); // Reset form after successful submission
      } else {
        // Handle cases where the response may not be in the expected format
        throw new Error("Unexpected response from the server.");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        "An error occurred while posting the job";
      toast.error(errorMessage);

      console.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl text-gray-800 font-semibold mb-6 mt-8">
        Post a Job
      </h2>
      <Suspense fallback={<Spinner />}>
        <EmployerJobForm onSubmit={handleCreateJob} />
      </Suspense>
    </div>
  );
}
export default PostJobPage;
