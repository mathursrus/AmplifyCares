import React, { useState } from 'react';
import { ReactMic } from 'react-mic';
import { getApiHost } from './utils/urlUtil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';

const SpeechRecognition = ({endpoint, onResults}) => {
    
  const [isRecording, setIsRecording] = useState(false);
  
  useState(() => {
    console.log("Endpoint is ", endpoint, "onResults is ", onResults);
  });

  const onStop = (recordedData) => {
    // Check if there's audio data
    if (recordedData.blob.size > 0) {
        // Play back the recorded audio
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

            fetch(getApiHost() + `/${endpoint}`, {
              method: "POST",
              headers: {
              "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
          })
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
              resolve(result); // Resolve with the URL from the server response
          })
          .catch((error) => {
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
        <FontAwesomeIcon
          icon={faMicrophone}
          size="2x"
          color={isRecording ? 'red' : 'green'}
        />
      </div>
      {/*<audio ref={audioRef} controls style={{ display: 'none' }} />*/}
      <ReactMic
        record={isRecording}
        onStop={onStop}
        mimeType="audio/wav"
        border="none"
        strokeColor="transparent"
        backgroundColor="transparent"
        width={0} // Adjust the width as needed
        height={0} // Adjust the height as needed
      />
      </center>
    </div>
  );  
};

export default SpeechRecognition;
