import React from "react";

const ApplyButtonModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-10 overflow-y-auto"
      aria-modal="true"
      role="dialog"
    >
      <div className="flex items-center justify-center min-h-screen">
        <button
          className="fixed inset-0 bg-black opacity-30"
          onClick={onClose}
          aria-label="Close modal"
          style={{ border: "none" }}
        ></button>

        <div
          className="modal-box"
          id="confirmationModal"
          aria-labelledby="modalTitle"
          aria-describedby="modalDescription"
        >
          <h3 className="font-bold text-lg" id="modalTitle">
            Confirm Application
          </h3>
          <p className="py-4" id="modalDescription">
            Are you sure you want to apply for this position with your current
            profile details?
          </p>
          <div className="modal-action">
            <button onClick={onConfirm} className="btn btn-primary">
              Submit Application
            </button>
            <button onClick={onClose} className="btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyButtonModal;
