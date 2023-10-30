import React from 'react';
import { Link } from 'react-router-dom';
import './SelfCareCircles.css';

const SelfCareCircles = ({ circles, onCheckInClick }) => {

  /*console.log("Got circles ", circles);*/
    
  const handleCheckInClick = (e, circle) => {
    // Call the onCheckInClick callback to populate the form
    e.preventDefault();
    onCheckInClick(circle);
  };

  function getParticipantsTooltip(cirle) {
    const participants = cirle.participants;
    if (participants.length === 0)  {
      return "No one in the circle yet. Start the circle."
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
          <img src={(circle.selfOrTogether === 'DIY' ? 'diy.jpg' : (circle.selfOrTogether === 'DIT' ? 'dit.jpg' : null))} alt={circle.selfOrTogether} />
            <button onClick={(e) => handleCheckInClick(e, circle)} className="check-in-button">
                Check-In
            </button>
          </div>
          <Link className="URL" to={`/?showHabits=${circle.type}&habit=${circle._id}`}>                
            <h3 className="title">{circle.title}</h3>
          </Link>          
        </div>
      ))}
    </div>
  );
};

export default SelfCareCircles;
