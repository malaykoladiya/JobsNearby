import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WelcomeModal from "../components/WelcomeModal";

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isNewUser = location.state?.isNewUser || false;
  const [showModal, setShowModal] = useState(false);
  const userType = location.pathname.includes("/jobSeeker")
    ? "jobSeeker"
    : "employer";

  useEffect(() => {
    if (isNewUser) {
      setShowModal(true);
    }
  }, [isNewUser]);

  const renderHomeCards = (userType, navigate) => {
    const jobSeekerCards = [
      {
        title: "Search Jobs",
        description: "Find your perfect job match",
        link: "/jobSeeker/search-jobs",
      },
      {
        title: "Applied Jobs",
        description: "Review your applications",
        link: "/jobSeeker/applied-jobs",
      },
      {
        title: "Saved Jobs",
        description: "Your saved jobs for later review",
        link: "/jobSeeker/saved-jobs",
      },
      {
        title: "Manage Profile",
        description: "Update your personal information",
        link: "/jobSeeker/manageprofile",
      },
    ];

    const employerCards = [
      {
        title: "Post a Job",
        description: "Create listings to find the best candidates",
        link: "/employer/post-jobs",
      },
      {
        title: "View Jobs",
        description: "See the jobs you have posted",
        link: "/employer/viewposted-jobs",
      },
      {
        title: "Manage Profile",
        description: "Update your company details",
        link: "/employer/manageprofile",
      },
    ];

    const cards = userType === "jobSeeker" ? jobSeekerCards : employerCards;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-y-24 p-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="card bg-base-100 shadow-xl hover:shadow-2xl cursor-pointer w-3/4 mx-auto flex flex-col h-60 p-4"
            onClick={() => navigate(card.link)}
          >
            <div className="flex flex-col justify-center items-center text-center h-full">
              <h2 className="card-title">{card.title}</h2>
              <p>{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-center items-center my-10 text-xl font-semibold">
        <h1>Welcome to the Home Page</h1>
      </div>
      <div>{showModal && <WelcomeModal />}</div>
      {renderHomeCards(userType, navigate)}
    </div>
  );
};

export default HomePage;
