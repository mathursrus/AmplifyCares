import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserFriends, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import TimeEntryForm from './TimeEntryForm';
import './SelfCareCircles.css';
import { addCommentToRecommendation } from './utils/recommendationUtil';

const React = require('react');
const { useState } = React;

const SelfCareCircles = ({ circles, onCheckIn }) => {

  /*console.log("Got circles ", circles);*/
  // handle user checking in
  const [checkingInCircle, setCheckingInCircle] = useState(null); 
  
  const handleCheckInClick = (e, circle) => {
    e.preventDefault();
    setCheckingInCircle(circle);
  };
  
  const completeCheckIn = (itemData, comment) => {
    writeCircleComment(comment);    
    setCheckingInCircle(null);
    onCheckIn(itemData)
  }

  async function writeCircleComment(commentString) {
    addCommentToRecommendation(checkingInCircle._id, commentString);        
  }

  function getParticipantsTooltip(circle) {
    const participants = circle.participants;
    if (participants.length === 0)  {
      return "No one in the circle yet. Start the circle."
    }
    else{
      return "Circle members: \n" + participants.join('\n');
    }
  }

  return (
    <div className="self-care-circles-canvas">
      <center>
      <h3>Self Care Circles</h3>
      Join a self care circle, easily track time & share insights with your team members. Click any of the<FontAwesomeIcon icon={faInfoCircle} style={{ color: '#306DC8', marginLeft: '5px' }} /> icons below to start
      </center>
      <div className="circle-container">      
        {circles.map((circle, index) => (
          <div>
            <div className="circle" key={index}>        
              <Link to={`/?showHabits=${circle.type}&habit=${circle._id}&rand=${Math.random(1000)}`}>                
                <div className="participants-info" title={getParticipantsTooltip(circle)}>
                  <FontAwesomeIcon className="badge" icon={faUserFriends} /> {circle.participants.length}
                </div>
                <div className="circle-image">
                  <img src={(circle.selfOrTogether === 'DIY' ? 'diy.jpg' : (circle.selfOrTogether === 'DIT' ? 'dit.jpg' : null))} alt={circle.selfOrTogether} />            
                </div>                  
                <button onClick={(e) => handleCheckInClick(e, circle)} className="check-in-button">
                      +
                </button>
              </Link>    
              <h3 className="title">{circle.title}</h3>                  
            </div>                           
          </div>     
        ))}
        {
          checkingInCircle && (
              <div className="modal-time-entry">
                  <div className="modal-time-entry-header">
                    <FontAwesomeIcon className="modal-time-entry-close" icon={faTimes} onClick={() => setCheckingInCircle(null)} />
                  </div>                  
                  <TimeEntryForm 
                    activity={checkingInCircle.title}  
                    activityType={checkingInCircle.type}
                    onSubmit= {completeCheckIn}                    
                  />
              </div>
          )
        }
      </div>
    </div>
  );
};

export default SelfCareCircles;
