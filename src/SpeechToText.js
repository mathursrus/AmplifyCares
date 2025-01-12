import React, { useState, useEffect, useCallback } from 'react';
import { ReactMic } from 'react-mic';
import { postWithBodyAndToken } from './utils/urlUtil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import './SpeechToText.css';


const SpeechRecognition = ({endpoint, onResults, onHover}) => {
    
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(15); // Initial countdown time in seconds
  const [isProcessing, setIsProcessing] = useState(false);
  
  const startCountdown = useCallback ((time) => {
    setCountdown(time); // Reset the countdown to the maximum time
  
    const countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (!isRecording) {
          clearInterval(countdownInterval);          
        }        
        if (prevCountdown <= 1) {
          clearInterval(countdownInterval); // Stop the countdown when it reaches 0
          setIsRecording(false);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000); // Update the countdown every second
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      console.log("use state called and we are recording");
      // max recording for 15 seconds
      startCountdown(15);    
    }
  }, [isRecording, startCountdown]);
  

  const onStop = (recordedData) => {
    // Check if there's audio data
    if (recordedData.blob.size > 0) {        
      //playRecordedAudio(recordedData.blob);
      sendAudioForRecognition(recordedData.blob);
    }
  };  

  /*
  const playRecordedAudio = (audioBlob) => {
    // Create a URL for the audio blob and play it
    const audioURL = URL.createObjectURL(audioBlob);
    audioRef.current.src = audioURL;
    audioRef.current.play();
  };*/

  
  const sendAudioForRecognition = async (audioBlob) => {
    
    console.log("Audio Blob is ", audioBlob);
    setIsProcessing(true);

    return new Promise((resolve, reject) => {
        if (!audioBlob) {
          reject("No blob found");
          return;
        }// Create a FormData object and append the audio blob
        const reader = new FileReader();
        const requestBody = {};
        
        reader.onloadend = function () {
            const base64data = reader.result.split(",")[1];
            requestBody.item = base64data;
            requestBody.username = localStorage.getItem('userName');
            requestBody.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            postWithBodyAndToken(endpoint, requestBody, localStorage.getItem('usertoken'))
          .then(async (response) => {
          if (response.ok) {
              const result = await response.json();
              const final = await JSON.parse(result);
              console.log("Success is ", final);
              onResults(final);
          } else {
              onResults("We had an issue ", response.status);              
          }
          })
          .then((result) => {
              setIsProcessing(false)
              resolve(result); // Resolve with the URL from the server response
          })
          .catch((error) => {
              setIsProcessing(false)
              reject(error);
          });
        };
        reader.readAsDataURL(audioBlob);    
    });    
  };
  
  const toggleRecording = () => {
    setIsRecording((prevState) => !prevState);
  };

  return (
    <div>
      <center>
      <br></br>
      <div className="mic-icon" onClick={toggleRecording}>
        {!isProcessing && (<FontAwesomeIcon
          icon={faMicrophone}
          size="2x"
          color={isRecording ? 'red' : 'green'}
          title={onHover}          
        />)}
        {isRecording && <div className={`countdown-timer ${countdown < 4?'red':''}`}>{countdown}</div>}
        {isProcessing && (
          <div className="spinner-container">
            <div className="spinner"></div>
            <div>Just a second...</div>
          </div>
        )}
      </div>
      {/*<audio ref={audioRef} controls style={{ display: 'none' }} />*/}
      <ReactMic
        record={isRecording}
        onStop={onStop}
        mimeType="audio/wav"
        border="none"
        strokeColor='black'
        backgroundColor="transparent"
        width={0} // Adjust the width as needed
        height={0} // Adjust the height as needed
      />
      </center>
    </div>
  );  
};

export default SpeechRecognition;
