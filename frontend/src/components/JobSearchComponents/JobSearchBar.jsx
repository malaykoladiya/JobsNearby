import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useJobSearch } from "../../context/JobSearchContext";

const JobSearchBar = () => {
  const { handleSearch } = useJobSearch();
  const [localKeyword, setLocalKeyword] = useState("");
  const [localLocation, setLocalLocation] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "keyword") {
      setLocalKeyword(value);
    } else if (name === "location") {
      setLocalLocation(value);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Submitting search with:", localKeyword, localLocation);

    handleSearch({ keyword: localKeyword, location: localLocation });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-6 space-y-6"
    >
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            name="keyword"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Job titles, employers, or keywords"
            value={localKeyword}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            name="location"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Location"
            value={localLocation}
            onChange={handleInputChange}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-md flex items-center"
        >
          <FaSearch className="mr-2" />
          Search
        </button>
      </div>
    </form>
  );
};

export default JobSearchBar;
