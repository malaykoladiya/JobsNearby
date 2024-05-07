import React, { useEffect } from "react";
import JobCards from "../../components/JobSearchComponents/JobCards";
import { toast } from "react-hot-toast";
import { throttle } from "lodash";
import { useJobSearch } from "../../context/JobSearchContext";
import Spinner from "../../components/Spinner/Spinner";
import JobSearchBar from "../../components/JobSearchComponents/JobSearchBar";
import { useLocation } from "react-router-dom";

function SearchJobs() {
  const { setPage, jobs, setSelectedJob, isLoading, hasMore, handleSearch } =
    useJobSearch();

  useEffect(() => {
    // Define the function inside useEffect to capture the current state
    const throttledLoadMoreJobs = throttle(() => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.offsetHeight - 200 &&
        !isLoading &&
        hasMore
      ) {
        setPage((prevPage) => prevPage + 1);
      } else if (!hasMore) {
        toast("No more jobs available", {
          variant: "info",
        });
        // Remove the event listener when there are no more jobs
        window.removeEventListener("scroll", throttledLoadMoreJobs);
      }
    }, 1000);

    // Add the event listener with the throttled function
    window.addEventListener("scroll", throttledLoadMoreJobs);

    // Cleanup function to remove the event listener
    return () => {
      // Cancel any scheduled throttle calls
      throttledLoadMoreJobs.cancel();

      // Remove the event listener
      window.removeEventListener("scroll", throttledLoadMoreJobs);
    };
    // Dependencies array ensures this effect runs only when hasMore or isLoading changes
  }, [hasMore, isLoading, setPage]);

  const handleSearchSubmit = async (searchCriteria) => {
    await handleSearch(searchCriteria);
  };

  const urllocation = useLocation();

  useEffect(() => {
    // This effect will run when the location changes.
    const pathSegments = urllocation.pathname.split("/");
    // Check if the URL path is exactly the one showing job search without any jobId
    if (pathSegments.length === 3 && pathSegments[2] === "search-jobs") {
      setSelectedJob(null);
    }
  }, [urllocation, setSelectedJob]);

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-5 font-sans overflow-hidden">
      <div className="w-full p-5 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg mb-5">
        <JobSearchBar onSearch={handleSearchSubmit} />
      </div>

      <div className="mt-5">
        <JobCards jobs={jobs} basePath="/jobSeeker/search-jobs" />
        {isLoading && (
          <div className="flex justify-center items-center space-x-2 my-11">
            <Spinner />
            <span className="text-black">Loading...</span>
          </div>
        )}
      </div>

      {!isLoading && !hasMore && (
        <div className="mx-auto mt-5 max-w-md px-4 py-3 bg-gray-100 text-gray-800 text-center rounded-lg shadow">
          No more jobs available
        </div>
      )}
    </div>
  );
}

export default SearchJobs;
