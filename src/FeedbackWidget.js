import React, { useState, useRef } from 'react';
import { getApiHost } from './utils/urlUtil';

const FeedbackWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [recordedVideoURL, setRecordedVideoURL] = useState(null);
    const [recordedAudioURL, setRecordedAudioURL] = useState(null);
    //const [recordedCombinedURL, setRecordedCombinedURL] = useState(null);
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const videorecorderRef = useRef(null);
    const audiorecorderRef = useRef(null);
    const videoBlobRef = useRef(null);
    const audioBlobRef = useRef(null);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [issueURL, setIssueURL] = useState(null);
    const githubToken = "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";

    const handleOpen = () => {
        setIsOpen(true);
        setFeedback('');
        setRecordedAudioURL(null);
        setRecordedVideoURL(null);
        //setRecordedCombinedURL(null);
        setFeedbackSubmitted(false);
        setIssueURL(null);
        videoRef.current = null;
        audioRef.current = null;
        videorecorderRef.current = null;
        audiorecorderRef.current = null;
        videoBlobRef.current = null;
        audioBlobRef.current = null;
    };

  const handleClose = () => {
    setIsOpen(false);
    stopRecorder();
  };

  const startRecording = async () => {
    const code = await startDisplayMedia();
    console.log("Code is ", code);
    if (code === 200) {
        await startUserMedia();
    }
  }

  const startUserMedia = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  
      audioRef.current = audioStream;
      audioRef.current.srcObject = audioStream;
  
      const audioOptions = { mimeType: 'video/webm; codecs=vp9' };
      const audioRecorder = new MediaRecorder(audioStream, audioOptions);
  
      audiorecorderRef.current = audioRecorder;
  
      const audioChunks = [];
  
      audioRecorder.ondataavailable = (event) => {
        console.log("Got audio data ", event);
        audioChunks.push(event.data);
      };
  
      audioRecorder.onstop = async () => {
        console.log("Audio stop called with chunks ", audioChunks);
        if (audioChunks && audioChunks.length > 0) {
            const audioBlob = new Blob(audioChunks, { type: 'video/webm' });
            console.log("Audio blob ", audioBlob);
            setRecordedAudioURL(URL.createObjectURL(audioBlob));
            audioBlobRef.current = audioBlob;               
        }

        /*
        setTimeout(async () => {
            // Create the combined blob
            const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
            const audioBlob = new Blob(audioChunks, { type: 'video/webm' });        
            const videoArrayBuffer = await videoBlob.arrayBuffer();
            const audioArrayBuffer = await audioBlob.arrayBuffer();

            const combinedVideoBlob = new Blob([videoArrayBuffer], { type: 'video/webm' });
            const combinedAudioBlob = new Blob([audioArrayBuffer], { type: 'video/webm' });

            const combinedBlobs = [combinedVideoBlob, combinedAudioBlob];
            const combinedBlob = new Blob(combinedBlobs, { type: 'video/webm' });
            console.log("Vombined blob ", combinedBlob);
            setRecordedCombinedURL(URL.createObjectURL(combinedBlob));            
          }, 2000);
          */
      }

      audioRecorder.start();
  
      console.log('Started recording audio stream ', audioStream);
    } catch (error) {
      console.error('Error accessing user media devices:', error);
    }
  };

  const startDisplayMedia = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      console.log("Display stream ", displayStream)
      videoRef.current = displayStream;
      videoRef.current.srcObject = displayStream;
  
      const videoOptions = { mimeType: 'video/webm; codecs=vp9' };
      const videoRecorder = new MediaRecorder(displayStream, videoOptions);
  
      videorecorderRef.current = videoRecorder;
  
      const videoChunks = [];
      
      videoRecorder.ondataavailable = (event) => {
        console.log("Got video data ", event);
        videoChunks.push(event.data);
      };
  
      videoRecorder.onstop = async () => {
        console.log("Video stop called with chunks ", videoChunks);
        if (audiorecorderRef.current) {
            await audiorecorderRef.current.stop();
        }
        if (videoChunks && videoChunks.length > 0) {
            const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
            console.log("Video blob ", videoBlob);
            setRecordedVideoURL(URL.createObjectURL(videoBlob)); 
            videoBlobRef.current = videoBlob;               
        }
      };
  
      videoRecorder.start();      
      console.log('Started recording video stream ', displayStream);
      return 200;
    } catch (error) {
      console.error('Error accessing display media devices:', error);
      return 404;
    }
  };

  const stopRecorder = () => {
    if (videorecorderRef.current) {
        videorecorderRef.current.stop();
    }
    if (audiorecorderRef.current) {
        audiorecorderRef.current.stop();
    }
  };


  const uploadToAzure = (blob) => {
    console.log("Upload called with blob ", blob)
    return new Promise((resolve, reject) => {
      if (!blob) {
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
  
      reader.readAsDataURL(blob);
    });
  };  
  
  const handleSubmit = async () => {
    try {
      await stopRecorder();
      var gitContent = feedback;

      console.log("Submit called with ", videoBlobRef.current, ", and ", audioBlobRef.current);
      if (videoBlobRef.current) {
        const videoLink = await uploadToAzure(videoBlobRef.current);
        console.log("Got video link ", videoLink);
        gitContent = gitContent + (videoLink ? '\n Screen Recording Link: ' + videoLink : '');
      };

      if (audioBlobRef.current) {
        const audioLink = await uploadToAzure(audioBlobRef.current);
        console.log("Got audio link ", audioLink);
        gitContent = gitContent + (audioLink ? '\n Feedback Recording Link: ' + audioLink : '');
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
            <div>
                <div className="video-title">
                    <b>Screen Recording</b>
                </div>
                <div className="video-container">                
                    <div className="video-wrapper">
                    <video
                        ref={videoRef}
                        key={recordedVideoURL}
                        controls
                        className="video-control"
                    >
                        <source src={recordedVideoURL} type="video/webm" />
                    </video>
                    </div>
                </div>
            </div>
            )}

            {recordedAudioURL && (
            <div> 
                <div className="video-title">
                    <b>Your Feedback</b>
                </div>
                <div className="video-container">
                    <div className="video-wrapper">
                    <video
                        ref={audioRef}
                        key={recordedAudioURL}
                        controls
                        className="video-control"
                    >
                        <source src={recordedAudioURL} type="audio/webm" />
                    </video>
                    </div>
                </div>
            </div>
            )}
            {/*recordedCombinedURL && (
              <div className="video-container">
                <video
                  ref={audioRef}
                  key={recordedCombinedURL}
                  controls
                  className="video-control"
                >
                  <source src={recordedCombinedURL} type="video/webm" />
                </video>
              </div>
            )*/}
            <div className="button-group">
              <button onClick={startRecording}>Record Video</button>
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
