import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const WelcomeModal = () => {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(true);

  const navigateToProfileEdit = () => {
    navigate("/jobseeker/manageprofile");
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <>
      {modalIsOpen && (
        <div className="modal modal-open">
          <div className="modal-box relative">
            <label
              htmlFor="my-modal-3"
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={closeModal}
            >
              ✕
            </label>
            <h3 className="text-lg font-bold">Welcome to JobsNearby</h3>
            <p className="py-4">
              Please complete your profile for better job recommendations.
            </p>
            <div className="modal-action">
              <button
                onClick={navigateToProfileEdit}
                className="btn btn-neutral"
              >
                Complete Profile
              </button>
              <button onClick={closeModal} className="btn btn-outline">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WelcomeModal;
