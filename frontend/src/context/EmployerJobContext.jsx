import React, { createContext, useState, useContext, useEffect } from "react";
import httpClient from "../utils/httpClient";
import { useAuth } from "./AuthContext";

const EmployerJobContext = createContext();

export const EmployerJobProvider = ({ children }) => {
  const { userType } = useAuth(); // Get userType directly from AuthContext

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const employerFetchJobs = async () => {
    if (jobs.length > 0) {
      // If jobs data is already available, don't make an API call
      return;
    }
    try {
      const response = await httpClient.get("/employer/viewjobs");
      setJobs(response.data.jobs);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    }
  };

  useEffect(() => {
    if (userType === "employer") {
      employerFetchJobs();
    }
  }, []);

  const handleSelectJob = (job) => {
    setSelectedJob(job);
  };

  const value = {
    jobs,
    setJobs,
    selectedJob,
    handleSelectJob,
    employerFetchJobs,
  };

  return (
    <EmployerJobContext.Provider value={value}>
      {children}
    </EmployerJobContext.Provider>
  );
};

export const useEmployerJob = () => useContext(EmployerJobContext);
