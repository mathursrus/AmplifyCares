import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrophy, faSmile, faRocket, faBolt } from '@fortawesome/free-solid-svg-icons'; // Import icons
import { getApiUrl } from './utils/urlUtil';
import './DailySelfCareChallenge.css';

function DailySelfCareChallenge({ onSubmit, onClose }) {
  const [challenge, setChallenge] = useState(null);

  // Function to handle closing the modal
  const handleCloseModal = () => {
    onClose();
  };

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(getApiUrl("/getDailyChallenges/?date=" + new Date().toDateString()));
      const data = await response.json();
      setChallenge(JSON.parse(data));
    }
    console.log("Called Daily Challenge class");
    fetchData();
  }, []);

  const dailyChallengeComplete = () => {
    console.log("Completed Daily Challenge");

    const activity = "daily challenge";

    const now = new Date();

    const itemData = {
        name: localStorage.getItem('userName'),
        DateTime: now.toLocaleDateString(),
        lastEdited: now,
    };
    if (challenge.activityType === 1) {
        itemData.mental_health_time = 2;
        itemData.mental_health_activity = [activity];
    }
    if (challenge.activityType === 2) {
        itemData.physical_health_time = 2;
        itemData.physical_health_activity = [activity];
    }
    if (challenge.activityType === 3) {
        itemData.spiritual_health_time = 2;
        itemData.spiritual_health_activity = [activity];
    }
    if (challenge.activityType === 4) {
        itemData.societal_health_time = 2;
        itemData.societal_health_activity = [activity];
    }        
    console.log(itemData);
    const comment = "Rocked the daily challenge on " + now.toLocaleDateString();    
    console.log("Comment is ", comment);
    onSubmit(itemData, comment);
  };

  return (
    <div className="daily-challenge-container">
      {challenge ? (
        <div className="daily-challenge-content">
          <div className="challenge-title">
            <FontAwesomeIcon icon={faRocket} className="icon" /> {/* Rocket icon */}
            <h4 className="challenge-title">Your Daily Self Care Challenge</h4>
            <FontAwesomeIcon icon={faBolt} className="icon" /> {/* Rocket icon */}
          </div>
          <span className="close-button" onClick={handleCloseModal}>
            <FontAwesomeIcon icon={faTimes} /> {/* Close icon */}
          </span>
          <div className="screen-container">
            {challenge.challenge}
          </div>          
          <div className='row'>
            <Button className="challenge-complete" onClick={dailyChallengeComplete}>
              <FontAwesomeIcon icon={faTrophy} className="icon" /> {/* Trophy icon */}              
              <b>Challenge Completed !!</b>
              <FontAwesomeIcon icon={faSmile} className="icon" /> {/* Smile icon */}              
            </Button>
          </div>
        </div>
      ) : (
        "Loading ..."
      )}
    </div>
  );
}

export default DailySelfCareChallenge;
