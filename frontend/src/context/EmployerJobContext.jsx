import React, { createContext, useState, useContext, useEffect } from "react";
import httpClient from "../utils/httpClient";
import { useAuth } from "./AuthContext";

const EmployerJobContext = createContext();

export const EmployerJobProvider = ({ children }) => {
  const { userType } = useAuth(); // Get userType directly from AuthContext

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const cacheJobs = (jobs) => {
    sessionStorage.setItem("employerPostedJobs", JSON.stringify(jobs));
  };

  const fetchJobsFromCache = () => {
    const cachedJobs = sessionStorage.getItem("employerPostedJobs");
    if (cachedJobs) {
      return JSON.parse(cachedJobs);
    }
    return null;
  };

  const employerFetchJobs = async () => {
    const cachedJobs = fetchJobsFromCache();
    if (cachedJobs) {
      setJobs(cachedJobs);
      return;
    }
    try {
      const response = await httpClient.get("/employer/viewjobs");
      if (response.data && response.data.jobs) {
        setJobs(response.data.jobs);
        cacheJobs(response.data.jobs);
      }
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
