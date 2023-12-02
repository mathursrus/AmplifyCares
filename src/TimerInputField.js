import React, { useState } from 'react';
import { evaluate } from 'mathjs';
import ReactCountdownClock from 'react-countdown-clock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHourglassStart } from '@fortawesome/free-solid-svg-icons'; // Import icons

import './TimerInputField.css';

const TimerInputField = ({value, placeholder, setValue}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [timerValue, setTimerValue] = useState(0);
  const alarm = new Audio('/alarm.mp3');

  const handleStartCountdownClick = (e) => {
    e.preventDefault();
    setShowDialog(true);
    setTimerValue(value === '' ? 10:evaluate(value)*60);
  };

  const handleStop = () => {
    setValue((Math.round(timerValue/60)).toString());   
    alarm.play();
  };  
  
  const handleClose = () => {
    setShowDialog(false);        
  };    

  return (
    <div className="timer-container">        
        <input
            type="text"
            className="text-field time-input"
            value={value}
            onChange={(e) => {
                const input = e.target.value;
                try {
                    const result = evaluate(input);
                    const time = result.toString();                    
                    setValue(time);
                } catch (error) {
                    const time = '';
                    setValue(time);
                }
            }}
            placeholder={placeholder}
        />        
        {!showDialog && (
            <div className="timer-tooltip-content">
                <button onClick={handleStartCountdownClick}>
                    <FontAwesomeIcon icon={faHourglassStart} />
                </button>
            </div>        
        )}

        {showDialog && (
            <div className="dialog">
                <span className="close-button" onClick={handleClose}>
                    <FontAwesomeIcon icon={faTimes} /> 
                </span>                        
                <ReactCountdownClock seconds={timerValue}
                     color="green"
                     alpha={1}
                     size={100}
                     fontsize={20}
                     onComplete={handleStop} />                
            </div>
        )}
    </div>
  );
}

export default TimerInputField;
