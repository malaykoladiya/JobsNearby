// pages/PostJobPage.js

import React from "react";
import EmployerJobForm from "../../components/EmployerJobComponents/EmployerJobForm";
import httpClient from "../../utils/httpClient";
import { toast } from "react-hot-toast";

function PostJobPage() {
  const API_URL = "/employer/postjob";

  const handleCreateJob = async (formData, { resetForm }) => {
    // Make a POST request to create a new job with the formData
    try {
      const response = await httpClient.post(API_URL, formData);
      toast.success(response.data.message || "Job posted successfully!");

      resetForm(); // Reset form after successful submission
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
      <EmployerJobForm onSubmit={handleCreateJob} />
    </div>
  );
}
export default PostJobPage;
