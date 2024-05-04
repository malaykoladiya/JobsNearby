import React, {useEffect, useState} from 'react';
import { useLocation } from 'react-router-dom';
import WelcomeModal from '../components/WelcomeModal';


const HomePage = () => {
  const location = useLocation();
  const isNewUser = location.state?.isNewUser || false;
 const [showModal, setShowModal] = useState(false); 
  


 useEffect(() => {
  if(isNewUser){
    setShowModal(true);
  }
 }, [isNewUser])
  
  return (
    <div>
      <div>
        <h1>Welcome to the Home Page</h1>
        <p>You have arrived on the home page.</p>
      </div>
    
      <div>
        {showModal && <WelcomeModal/>}
      </div>
    </div>

  );
};

export default HomePage;
