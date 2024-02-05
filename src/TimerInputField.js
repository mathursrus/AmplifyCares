import React, { useState } from 'react';
import { evaluate } from 'mathjs';
//import ReactCountdownClock from 'react-countdown-clock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHourglassStart } from '@fortawesome/free-solid-svg-icons'; // Import icons
import { useStopwatch, useTimer  } from 'react-timer-hook';
import './TimerInputField.css';

const TimerInputField = ({value, placeholder, setValue}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [timerValue, setTimerValue] = useState(0);
  const [expiryTimestamp, setExpiryTimestamp] = useState(null);
  const [direction, setDirection] = useState('up');
  const alarm = new Audio('/alarm.mp3');

  function MyStopwatch() {
    const {
      seconds,
      minutes,
      hours,            
    } = useStopwatch({ autoStart: true });

    return (
        <div className="stopwatch">
          <span className="close-button" onClick={()=>{
            console.log("Timer value ", hours, minutes, seconds, Math.round(hours*3600+minutes*60+seconds)/60);
            setValue(Math.round((hours*3600+minutes*60+seconds)/60).toString()); 
            handleClose()}}>
            <FontAwesomeIcon icon={faTimes} />
          </span>            
          <div>
            <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
          </div>          
        </div>
        );
  }

  function MyTimer({ expiryTimestamp }) {
    const {
      seconds,
      minutes,
      hours,      
    } = useTimer({ expiryTimestamp, onExpire: () => handleStop() });
  
    return (
      <div className='stopwatch'>
        <span className="close-button" onClick={()=>{
            console.log("Timer value ", hours, minutes, seconds, Math.round(timerValue - hours*3600 - minutes*60 - seconds));
            setValue(Math.round((timerValue - hours*3600 - minutes*60 - seconds)/60).toString()); 
            handleClose()}}>
            <FontAwesomeIcon icon={faTimes} />
        </span>
        <div>
          <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
        </div>
      </div>
    );
  }

  const handleStartCountdownClick = (e) => {
    e.preventDefault();
    setShowDialog(true);
    console.log("Timer value ", value);
    setTimerValue(!value || value === '' ? 0:evaluate(value)*60);
    const time = !value || value === '' ? 0:evaluate(value)*60;
    const date = new Date();
    date.setSeconds(date.getSeconds() + time);
    setExpiryTimestamp(date);
    setDirection(!value || value === '' ? 'up':'down');
  };

  const handleStop = () => {
    //setValue((Math.round(timerValue/60)).toString());   
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
            value={value || ''}
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
                <div className="dialog-content">                    
                    {direction === 'down' ? (
                        <MyTimer
                            expiryTimestamp={expiryTimestamp}
                        />
                        /*
                        <ReactCountdownClock
                            seconds={timerValue}
                            color="green"
                            alpha={0.8}
                            size={100}
                            fontsize={12}
                            onComplete={handleStop}
                        />
                        */
                    ) : (
                        <MyStopwatch                            
                        />
                    )}                    
                </div>
            </div>
        )}
    </div>
  );
}

export default TimerInputField;
