import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import ReactCountdownClock from 'react-countdown-clock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrophy, faSmile, faRocket, faBolt } from '@fortawesome/free-solid-svg-icons'; // Import icons
import { getApiUrl } from './utils/urlUtil';
import './DailySelfCareChallenge.css';
import { Link } from 'react-router-dom';

function DailySelfCareChallenge({ onSubmit, onClose }) {
  const [challenge, setChallenge] = useState(null);
  const [countingDown, setCountingDown] = useState(false);
  const alarm = new Audio('/alarm.mp3');

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

  const startCountDown = () => {
    setCountingDown(true);
  }

  const stopCountDown = () => {
    alarm.play();
    setTimeout(() => {
      setCountingDown(false); 
    }, 5000); 
  }

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
            <br></br>  <br></br>       
            {!countingDown ? (
              <div>
                <i>
                Do not spend more than 2 minutes on this activity. Time yourself by clicking
                <Link to="." onClick={startCountDown}> here</Link>
                </i>
              </div>
            ) : (
              <ReactCountdownClock seconds={120}
                    color="green"
                    alpha={0.8}
                    size={100}
                    fontsize={12}
                    onComplete={stopCountDown} />                        
            )}
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
