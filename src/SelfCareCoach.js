import React, { useState, useEffect, useCallback } from 'react';
import { Widget, addResponseMessage, addUserMessage, setQuickButtons, toggleInputDisabled, toggleMsgLoader, toggleWidget } from 'react-chat-widget';
import { postWithBodyAndToken } from './utils/urlUtil';
import 'react-chat-widget/lib/styles.css';
import './SelfCareCoach.css'; // Import a CSS file for styling

const SelfCareCoach = () => {
  const [sessionId, setSessionId] = useState(null);  
  const [isProcessing, setIsProcessing] = useState(false);

  const getSelfCareInsights = useCallback((question) => {    
    console.log("Get self-care insights called");
    setIsProcessing(true);
    toggleInputDisabled();
    toggleMsgLoader();

    return new Promise((resolve, reject) => {
        
        const requestBody = {};
                
        requestBody.user = localStorage.getItem('userName');        
        requestBody.question = question;
        if (sessionId !== null) {
            requestBody.sessionId = sessionId;
        }

        postWithBodyAndToken(`/seekCoaching`, 
                            requestBody, 
                            localStorage.getItem('usertoken'))
        .then(async (response) => {
            if (response.ok) {
                const result = await response.json();
                const final = await JSON.parse(result);
                console.log("Got coching responses ", final);
                setSessionId(final.sessionToken);  
                addResponseMessage(final.messages[0].content[0].text.value);
                return final.messages;
            } else {
                console.log("We had an issue ", response.status);              
            }
        })
        .then((result) => {
            resolve(result); // Resolve with the URL from the server response
        })
        .catch((error) => {
            reject(error);
        })
        .finally(() => {
            setIsProcessing(false);
            toggleInputDisabled();
            toggleMsgLoader();
        });
    });           
  }, [sessionId]);

  /*useEffect(() => {
    if (isProcessing) {
      toggleInputDisabled(true);
      toggleMsgLoader(true);
    }
    else {
      toggleInputDisabled(false);
      toggleMsgLoader(false);
    }
  }, [isProcessing]);*/

  useEffect(() => {
    toggleWidget(true);
    console.log("Toggled Copilot to show");
    setQuickButtons([
      {label: 'Have I been consistent in my self care routine?', value: 'Have I been consistent in my self care routine?'},
      {label: 'How does my physical care compare to the best of my peers?', value: 'How does my physical care compare to the best of my peers?'},
      {label: 'What social care circles can i join with my peers?', value: 'What social care circles can i join with my peers?'},
      {label: 'What spiritial care circles do my peers participate in?', value: 'What spiritial care circles do my peers participate in?'}
    ]);

    return () => {
      // Toggle the widget to close when the component is unmounted
      toggleWidget(false);
      console.log("Toggled Copilot to hide");
    };
  });

  const handleNewUserMessage = (newMessage) => {
    console.log("Got message ", newMessage);
    getSelfCareInsights(newMessage);
  }  

  const handleQuickButton = (value) => {
    addUserMessage(value);
    handleNewUserMessage(value);
  }  

  return (
    <div className='self-care-coach-container'>
        <Widget
            title="Self Care Coach"
            subtitle="Your personalized self care assistant (Beta)"
            handleNewUserMessage={handleNewUserMessage}
            isOpen={true}
            handleQuickButtonClicked={handleQuickButton}
            senderPlaceHolder={(!isProcessing?"Type your self care question here..." : "Processing ...")}// Set a placeholder for the input box        
            />              
    </div>
  );
};

export default SelfCareCoach;
