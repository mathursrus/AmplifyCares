import React, { useState, useRef } from 'react';
import { getApiHost } from './utils/urlUtil';

const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [recordedVideoURL, setRecordedVideoURL] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [issueURL, setIssueURL] = useState(null);
  const blobRef = useRef(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const githubToken = "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";

  const handleOpen = () => {
    setIsOpen(true);
    setFeedback('');
    setRecordedVideoURL(null);
    setFeedbackSubmitted(false);
    setIssueURL(null);
    blobRef.current = null;
    videoRef.current = null;
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
  };

  const handleClose = () => {
    setIsOpen(false);
    stopMediaStream();
  };

  const startMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true, // Capture audio from microphone
      });
      console.log('Stream tracks:', stream);
      mediaStreamRef.current = stream;
      videoRef.current = stream;      
      videoRef.current.srcObject = stream; // Set the new stream

      startMediaRecorder(stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      const tracks = mediaStreamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  };

  const startMediaRecorder = (stream) => {
    const options = { mimeType: 'video/webm' };
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    console.log("Started media recorder");    
  };

  const handleDataAvailable = async (event) => {
    console.log("Got event data");
    if (event.data.size > 0) {
      const recordedBlob = new Blob([event.data], { type: 'video/webm' });
      setRecordedVideoURL(URL.createObjectURL(recordedBlob));
      console.log("Recorded blob ", recordedBlob);
      blobRef.current = recordedBlob;
      stopMediaStream();      
    }
  };

  const uploadToAzure = () => {
    return new Promise((resolve, reject) => {
      if (!blobRef.current) {
        reject("No blob found");
        return;
      }
  
      const reader = new FileReader();
      const requestBody = {};
  
      reader.onloadend = function () {
        const base64data = reader.result.split(",")[1];
        requestBody.item = base64data;
  
        fetch(getApiHost() + "/writeFeedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })
          .then((response) => {
            if (response.ok) {
              console.log("Success ", response);
              return response.text();
            } else {
              throw new Error("Upload failed: " + response.status);
            }
          })
          .then((result) => {
            resolve(result); // Resolve with the URL from the server response
          })
          .catch((error) => {
            reject(error);
          });
      };
  
      reader.readAsDataURL(blobRef.current);
    });
  };  
  
  const handleSubmit = async () => {
    try {
      await stopMediaStream();
      var gitContent = feedback;
      if (blobRef.current) {
        const videoLink = await uploadToAzure();
        console.log("Got video link ", videoLink);
        gitContent = gitContent + (videoLink ? '\n Video Link: ' + videoLink : '');
      };

      const issueData = {
        title: 'Feedback from ' + localStorage.getItem('userName'),
        body: gitContent 
      };
  
      const response = await fetch('https://api.github.com/repos/mathursrus/AmplifyCares/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + githubToken, // Replace with your GitHub access token
        },
        body: JSON.stringify(issueData),
      });
  
      if (response.ok) {
        const issue = await response.json();
        console.log('GitHub issue created:', issue.html_url);
        setIssueURL(issue.html_url);
        setFeedbackSubmitted(true);
      } else {
        console.error('Failed to create GitHub issue:', response.text());
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <div className={`feedback-widget ${isOpen ? 'open' : ''}`}>
      {isOpen ? (
        feedbackSubmitted ? (
          <div className="feedback-widget">
            <div className="thank-you-message">
              Thank you for your feedback. We have logged it&nbsp;
              {issueURL && (
                <>
                  <a href={issueURL} target="_blank" rel="noopener noreferrer">
                    here
                  </a>
                  .
                </>
              )}
              <button className="close-button" onClick={handleClose}>
                X
              </button>
            </div>
          </div>
        ) : (
          <div className="feedback-form">
            <textarea
              placeholder="We appreciate your feedback. Feel free to use the Record functionality for high fidelity screen capture."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            {recordedVideoURL && (
              <div className="video-container">
                <video
                  ref={videoRef}
                  key={recordedVideoURL}
                  controls
                  className="video-control"
                >
                  <source src={recordedVideoURL} type="video/webm" />
                </video>
              </div>
            )}
            <div className="button-group">
              <button onClick={startMediaStream}>Record Video</button>
              <button onClick={handleSubmit}>Submit</button>
              <button onClick={handleClose}>Cancel</button>
            </div>
          </div>
        )
      ) : (
        <div className="feedback-button" onClick={handleOpen}>
          Feedback
        </div>
      )}
    </div>
  );  
};

export default FeedbackWidget;
