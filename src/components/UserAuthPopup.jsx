import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoginPopup from './Login';

const UserAuthPopup = () => {
  const location = useLocation();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    // Extract the path parameters from the URL
    const pathSegments = location.pathname.split('/');
    const userId = pathSegments[1];
    const username = pathSegments[2];

    // If userId or username is missing, show login popup
    if (!userId || !username) {
      setShowLoginPopup(true);
    }
  }, [location]);

  const handleCloseLoginPopup = () => setShowLoginPopup(false);

  return (
    <>
      {showLoginPopup && <LoginPopup onClose={handleCloseLoginPopup} />}
    </>
  );
};

export default UserAuthPopup;
