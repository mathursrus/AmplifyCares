import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import TimeEntryForm from './TimeEntryForm';
import './SelfCareCircles.css';
import { addCommentToRecommendation, getDailyChallengeCircle } from './utils/recommendationUtil';
import DailySelfCareChallenge from './DailySelfCareChallenge';

const React = require('react');
const { useState } = React;

const SelfCareCircles = ({ circles, onCheckIn }) => {

  /*console.log("Got circles ", circles);*/
  // handle user checking in
  const [checkingInCircle, setCheckingInCircle] = useState(null); 

  if (circles.find(circle => circle.type === 5) === undefined) {
    circles.push(getDailyChallengeCircle());
  }

  const handleCheckInClick = (e, circle) => {
    e.preventDefault();
    console.log("Setting checking in circle to ", circle);
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

  /*function getParticipantsTooltip(circle) {
    const participants = circle.participants;
    if (participants.length === 0)  {
      return "No one in the circle yet. Start the circle."
    }
    else{
      return "Circle members: \n" + participants.join('\n');
    }
  }*/

  return (
    <div className="self-care-circles-canvas">
      <h3 className='circles-header'>Self Care Circles</h3>
      <h5 className='circles-text'>
        Enhance your self care by joining others. Explore and create self care circles here -  
        <Link to="/?showHabits=1"> Mental Care</Link>, <Link to="/?showHabits=2">Physical Care</Link>, <Link to="/?showHabits=3">Spiritual Care</Link>, <Link to="/?showHabits=4">Social Care</Link>.
      </h5>
      {circles.length === 0 && (
        <span className='circles-text'><br></br>Here is a circle to get you started <Link to="/?showHabits=5">Daily Challenge</Link></span>
      )}
      <div className="circle-container">              
        {circles.map((circle, index) => (
          (circle.circlestate !== 'expired') && (
          <div key={index}>
            <div className="circle">        
              <Link to={`/?showHabits=${circle.type}&habit=${circle._id}&rand=${Math.random(1000)}`}>                
                {/*<div className="participants-info" title={getParticipantsTooltip(circle)}>
                  <FontAwesomeIcon className="badge" icon={faUserFriends} /> {circle.participants.length}
                </div>*/}
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
          )
        ))}
        {
          checkingInCircle && checkingInCircle.type === 5 && (                                
            <DailySelfCareChallenge 
              onClose={() => setCheckingInCircle(null)}
              onSubmit= {completeCheckIn}                    
            />              
          )
        }
        {
          checkingInCircle && checkingInCircle.type < 5 && (
            <div className="modal-container">
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
            </div>
          )
        }        
      </div>
    </div>
  );
};

export default SelfCareCircles;
