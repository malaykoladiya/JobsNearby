import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import httpClient from "../utils/httpClient";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext";

const JobSearchContext = createContext();

export const JobSearchProvider = ({ children }) => {
  const { userType, profile, updateProfile } = useAuth();

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [savedJobIDs, setSavedJobIDs] = useState(new Set());
  const [savedJobData, setSavedJobData] = useState([]);

  const API_USER_SEARCH_JOBS = "/user/searchjobs";
  const API_USER_APPLIED_JOBS = "/user/appliedjobs";
  const API_USER_SAVED_JOBS = "/user/saved-jobs";

  // Function to fetch jobs based on search criteria
  const fetchJobs = useCallback(async () => {
    if (userType !== "jobSeeker") {
      return; // Only job seekers should fetch jobs
    }
    setIsLoading(true);
    try {
      const response = await httpClient.get(API_USER_SEARCH_JOBS, {
        params: { page, limit, keyword, location },
      });
      const { search_job_data: newJobs } = response.data;

      if (newJobs.length === 0) {
        setHasMore(false);
        setJobs(page === 1 ? [] : jobs);
        if (page === 1) toast.error("No results found.");
      } else {
        setJobs((prevJobs) =>
          page === 1
            ? newJobs
            : [
                ...prevJobs,
                ...newJobs.filter(
                  (job) => !prevJobs.some((p) => p._id === job._id)
                ),
              ]
        );
        setHasMore(newJobs.length === limit);
      }
    } catch (error) {
      toast.error("An error occurred while fetching jobs: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, location, page, limit, userType]);

  useEffect(() => {
    if (userType === "jobSeeker") {
      fetchJobs(); // Fetch jobs on page change or on initial load
    }
  }, [page, keyword, location, fetchJobs, userType]);

  const handleSearch = async (searchCriteria) => {
    setKeyword(searchCriteria.keyword);
    setLocation(searchCriteria.location);
    setPage(1); // Reset to the first page
    setJobs([]);
    setHasMore(true);
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
  };

  const addAppliedJob = useCallback((newJob) => {
    setAppliedJobs((prevJobs) => [...prevJobs, newJob]);
  }, []);

  // Function to fetch applied jobs
  const fetchAppliedJobs = useCallback(async () => {
    if (userType !== "jobSeeker") {
      return; // Only job seekers should fetch applied jobs
    }
    try {
      const response = await httpClient.get(API_USER_APPLIED_JOBS);
      setAppliedJobs(response.data.jobs_applied);
    } catch (error) {
      toast.error("An error occurred while fetching applied jobs.");
    }
  }, []);

  useEffect(() => {
    if (userType === "jobSeeker") {
      fetchAppliedJobs(); // Fetch applied jobs if user is a job seeker
    }
  }, [fetchAppliedJobs]);

  // Function to fetch saved jobs
  const fetchSavedJobs = useCallback(async () => {
    if (userType !== "jobSeeker") {
      return; // Only job seekers should fetch saved jobs
    }
    try {
      const response = await httpClient.get(API_USER_SAVED_JOBS);
      setSavedJobData(response.data);
      setSavedJobIDs(new Set(response.data.map((job) => job._id)));
    } catch (error) {
      console.error("Failed to fetch saved jobs", error);
    }
  }, []);

  useEffect(() => {
    if (profile && userType === "jobSeeker") {
      fetchSavedJobs();
    }
  }, [profile, fetchSavedJobs]);

  const toggleSaveJob = async (jobId) => {
    const newSavedJobs = new Set(savedJobIDs);
    if (newSavedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
    } else {
      newSavedJobs.add(jobId);
    }

    const updatedProfileData = {
      ...profile,
      jobSeekerSavedJobs: Array.from(newSavedJobs),
    };

    try {
      const response = await updateProfile(userType, updatedProfileData);
      setSavedJobIDs(newSavedJobs);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const value = {
    keyword,
    setKeyword,
    location,
    setLocation,
    page,
    setPage,
    jobs,
    setJobs,
    appliedJobs,
    selectedJob,
    setSelectedJob,
    isLoading,
    setIsLoading,
    hasMore,
    setHasMore,
    savedJobIDs,
    savedJobData,
    handleSearch,
    handleSelectJob,
    toggleSaveJob,
    fetchJobs,
    addAppliedJob,
  };

  return (
    <JobSearchContext.Provider value={value}>
      {children}
    </JobSearchContext.Provider>
  );
};

export const useJobSearch = () => useContext(JobSearchContext);
