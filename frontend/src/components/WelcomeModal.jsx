import React, {useState} from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
// import './WelcomeModal.css';

const WelcomeModal = () => {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(true);
 
  // Handle navigation to profile edit page
  const navigateToProfileEdit = () => {
    navigate('/jobseeker/manageprofile'); // Replace with your actual route
  };
  
  const closeModal = () => {
    setModalIsOpen(false);
  };


  return (
    <Modal
      isOpen={true}
      onRequestClose = {closeModal}
      contentLabel="Welcome Modal"
      className="bg-white p-5 rounded-md shadow-md max-w-md w-full font-roboto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-40"
    >
      <h2 className="mt-0 text-gray-800 font-bold text-lg"> Welcome to JobsNearby</h2>
      <p className="text-gray-700 text-base leading-6">Please complete your profile for better job recommendations.</p>
      <div className="flex mt-4">
        <button 
          onClick={navigateToProfileEdit}
          className="bg-blue-500 text-white font-medium py-2 px-4 rounded-md mr-2 hover:opacity-90 transition-opacity duration-300">
            Complete Profile
        </button>
        <button 
          onClick={closeModal}
          className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:opacity-90 transition-opacity duration-300">
            Close
        </button>
      </div>
    </Modal>
  );
};

export default WelcomeModal;
