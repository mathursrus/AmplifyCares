import React, { useState, useEffect, useCallback } from 'react';
import { Widget, addResponseMessage, addUserMessage, setQuickButtons, toggleInputDisabled, toggleMsgLoader, toggleWidget } from 'react-chat-widget';
import { postWithBodyAndToken } from './utils/urlUtil';
import 'react-chat-widget/lib/styles.css';
import './SelfCareCoach.css'; // Import a CSS file for styling
import { useLocation } from 'react-router-dom';

const SelfCareCoach = () => {
  const [sessionId, setSessionId] = useState(null);  
  const [isProcessing, setIsProcessing] = useState(false);
  const [questionFetched, setQuestionFetched] = useState(false); // New state variable
  const location = useLocation();

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

  const handleNewUserMessage = useCallback((newMessage) => {
    console.log("Got message ", newMessage);
    getSelfCareInsights(newMessage);
  }, [getSelfCareInsights]);

  useEffect(() => {
    toggleWidget(true);
    console.log("Toggled Copilot to show");

    const searchParams = new URLSearchParams(location.search);
    const question = searchParams.get('question');
    if (question && !questionFetched) {
      console.log("Got question ", question);
      addUserMessage(question);
      handleNewUserMessage(question);
      setQuestionFetched(true); // Set questionFetched to true to indicate question is fetched            
    }
    if (question) {
      setQuickButtons([
        {label: 'Coach me through defining my ideal self', value: 'Coach me through defining my ideal self'},
        {label: 'What goals should I set?', value: 'What goals should I set?'},
        {label: 'What habits will help me hit my goals?', value: 'What habits will help me hit my goals?'},
        {label: 'Finalize these goals', value: 'Finalize these goals'}
      ]);
    }
    else {
      setQuickButtons([
        {label: 'Have I been consistent in my self care routine?', value: 'Have I been consistent in my self care routine?'},
        {label: 'How does my physical care compare to the best of my peers?', value: 'How does my physical care compare to the best of my peers?'},
        {label: 'What social care circles can i join with my peers?', value: 'What social care circles can i join with my peers?'},
        {label: 'Why is spiritual care necessary?', value: 'Why is spiritual care necessary?'}
      ]);
    }

    return () => {
      // Toggle the widget to close when the component is unmounted
      toggleWidget(false);
      setQuickButtons([]);
      console.log("Toggled Copilot to hide");
    };
  }, [handleNewUserMessage, location.search, questionFetched]);  

  const handleQuickButton = (value) => {
    addUserMessage(value);
    handleNewUserMessage(value);
  }  

  return (
    <div className='self-care-coach-container'>
        <Widget
            title="Self Care Coach"
            titleAvatar="/coach.png"
            profileAvatar="/coach.png"
            subtitle="Your personalized self care assistant"
            handleNewUserMessage={handleNewUserMessage}
            isOpen={true}
            handleQuickButtonClicked={handleQuickButton}
            senderPlaceHolder={(!isProcessing?"Type your self care question here..." : "Processing ...")}// Set a placeholder for the input box        
            />              
    </div>
  );
};

export default SelfCareCoach;
