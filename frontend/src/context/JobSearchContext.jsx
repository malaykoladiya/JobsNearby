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
    setIsLoading(true);
    try {
      const params = {
        page,
        limit,
        keyword,
        location,
      };
      const response = await httpClient.get(API_USER_SEARCH_JOBS, { params });
      console.log("consle in fetch job function: ", response.data);
      const newJobs = response.data.search_job_data;
      if (newJobs.length === 0) {
        setHasMore(false);
        if (page === 1) {
          // Assuming page starts at 1
          setJobs([]); // Clear jobs if it's a new search and no results are found
          toast.info("No results found.");
        }
        setIsLoading(false);
        return;
      } else {
        setJobs((prevJobs) => {
          if (page === 1) {
            // New search or initial load: Replace existing jobs with new ones
            return newJobs;
          } else {
            // Scrolling for more: Append new jobs avoiding duplicates
            const jobsSet = new Set(prevJobs.map((job) => job._id));
            const newUniqueJobs = newJobs.filter(
              (job) => !jobsSet.has(job._id)
            );
            return [...prevJobs, ...newUniqueJobs];
          }
        });
        setHasMore(newJobs.length === limit);
      }
    } catch (error) {
      toast.error("An error occurred while fetching jobs.");
    }
    setIsLoading(false);
  }, [keyword, location, page, limit]);

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const handleSearch = async (searchCriteria) => {
    console.log("Search initiated", searchCriteria);
    console.log("handleSearch", searchCriteria);

    setKeyword(searchCriteria.keyword);
    setLocation(searchCriteria.location);
    setPage(1);
    setJobs([]);
    setHasMore(true);
    await fetchJobs();
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
  };

  console.log("jobs in context", jobs);

  const addAppliedJob = useCallback((newJob) => {
    setAppliedJobs((prevJobs) => [...prevJobs, newJob]);
  }, []);

  // Function to fetch applied jobs
  const fetchAppliedJobs = useCallback(async () => {
    try {
      const response = await httpClient.get(API_USER_APPLIED_JOBS);
      setAppliedJobs(response.data.jobs_applied);
      console.log("applied jobs in context", response.data.jobs_applied);
    } catch (error) {
      toast.error("An error occurred while fetching applied jobs.");
    }
  }, []);

  useEffect(() => {
    fetchAppliedJobs();
  }, [fetchAppliedJobs]);

  // Function to fetch saved jobs
  const fetchSavedJobs = useCallback(async () => {
    try {
      const response = await httpClient.get(API_USER_SAVED_JOBS);
      // console.log("saved jobs in context fetchSavedJobs", response.data);
      setSavedJobData(response.data);
      setSavedJobIDs(new Set(response.data.map((job) => job._id)));
    } catch (error) {
      console.error("Failed to fetch saved jobs", error);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      fetchSavedJobs();
    }
  }, [profile, fetchSavedJobs]);

  // console.log("save jobs in searchcontext", savedJobIDs);

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
      // console.log(response.data);
      // console.log("Profile updated successfully");
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
