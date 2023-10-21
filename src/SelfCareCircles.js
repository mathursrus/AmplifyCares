import React from 'react';
import './SelfCareCircles.css';

const SelfCareCircles = ({ circles, onCheckInClick }) => {

  console.log("Got circles ", circles);
    
  const handleCheckInClick = (e) => {
    // Call the onCheckInClick callback to populate the form
    e.preventDefault();
    onCheckInClick('12@12', '2');
  };

  function getParticipantsTooltip(cirle) {
    const participants = cirle.participants;
    if (participants.length === 0)  {
      return "No one in the circle yet. Join and kick it off."
    }
    else{
      return "Circle members: \n" + participants.join('\n');
    }
  }

  return (
    <div className="circle-container">
      {circles.map((circle, index) => (
        <div className="circle" key={index}>
          <span className="badge" title={getParticipantsTooltip(circle)}>{circle.participants.length}</span>            
          <div className="circle-image">
            <img src="DIT.jpg" alt="DIT" />
            <button onClick={handleCheckInClick} className="check-in-button">
              Check-In
            </button>
          </div>
          <a href={circle.url} target='_blank' rel="noreferrer">{circle.title}</a>
        </div>
      ))}
    </div>
  );
};

export default SelfCareCircles;
