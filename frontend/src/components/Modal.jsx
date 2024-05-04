import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white shadow-md w-4/5 h-4/5 overflow-auto rounded-lg p-5 relative">
        <button
          className="absolute top-2.5 right-2.5 bg-none border-none cursor-pointer text-lg text-gray-600"
          onClick={onClose}
        >
          Close
        </button>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
