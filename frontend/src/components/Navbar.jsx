import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { logout, currentUser, userType } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(userType);
      document.getElementById("navbar-drawer").checked = false;
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const getHomeLinkRoute = () => {
    if (currentUser) {
      return userType === "employer" ? "/employer/home" : "/jobSeeker/home";
    } else {
      return "/";
    }
  };

  const homeLinkRoute = getHomeLinkRoute();

  const links = {
    employer: [
      { path: "/employer/post-jobs", text: "Post Jobs" },
      { path: "/employer/viewposted-jobs", text: "View Jobs" },
      { path: "/employer/manageprofile", text: "Manage Profile" },
      { path: "/employer/settings", text: "Settings" },
    ],
    jobSeeker: [
      { path: "/jobSeeker/search-jobs", text: "Search Jobs" },
      { path: "/jobSeeker/applied-jobs", text: "Applied Jobs" },
      { path: "/jobSeeker/saved-jobs", text: "Saved Jobs" },
      { path: "/jobSeeker/manageprofile", text: "Manage Profile" },
      { path: "/jobSeeker/settings", text: "Settings" },
    ],
    default: [
      { path: "/about-us", text: "About Us" },
      { path: "/", text: "Try it free" },
    ],
  };

  const renderLinks = (isMobile = false) => {
    const linkType = currentUser ? userType : "default";
    return links[linkType].map((link) => (
      <li key={link.text}>
        {/* {link.text} */}
        <Link
          to={link.path}
          className="btn btn-ghost md:text-md xl:text-lg font-semibold"
          onClick={() => {
            if (isMobile) {
              // Assuming "my-drawer" is the ID of your checkbox input
              const drawerCheckbox = document.getElementById("navbar-drawer");
              if (drawerCheckbox) {
                drawerCheckbox.checked = false;
              }
            }
          }}
        >
          {link.text}
        </Link>
      </li>
    ));
  };

  return (
    <div className="drawer z-50" data-theme="mytheme">
      <input id="navbar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="navbar bg-base-100">
          <div className="navbar-start">
            <label
              htmlFor="navbar-drawer"
              className="btn btn-square btn-ghost lg:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </label>
            <Link
              to={homeLinkRoute}
              className="btn btn-ghost normal-case text-2xl"
            >
              JobsNearby
            </Link>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal p-0">{renderLinks()}</ul>
          </div>
          <div className="navbar-end">
            {currentUser ? (
              <button className="btn lg:block hidden" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <button
                className="btn lg:block hidden"
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
            )}
          </div>
        </div>
        {/* Page content here */}
      </div>
      <div className="drawer-side">
        <label htmlFor="navbar-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 overflow-y-auto w-80 bg-base-100">
          {/* Sidebar content */}
          {!currentUser && (
            <li>
              <Link
                to="/"
                className="btn btn-ghost"
                onClick={() => {
                  document.getElementById("navbar-drawer").checked = false;
                }}
              >
                Log In
              </Link>
            </li>
          )}
          {renderLinks(true)}
          {currentUser && (
            <li>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
