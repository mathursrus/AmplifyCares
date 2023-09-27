import React, { useState, useEffect, useCallback } from 'react';
import { Widget, addResponseMessage, addUserMessage, deleteMessages, setQuickButtons, toggleWidget } from 'react-chat-widget';
import { getApiHost } from './utils/urlUtil';
import 'react-chat-widget/lib/styles.css';
import './CoPilot.css'; // Import a CSS file for styling

const CoPilot = ({endpoint, userprompts, systemprompts}) => {
  const [selectedOption, setSelectedOption] = useState(null);  
  const [isProcessing, setIsProcessing] = useState(true);  
  const [answers, setAnswers] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const getSelfCareInsights = useCallback((prompts) => {    
    console.log("Get self-care insights called");
    setIsProcessing(true);

    return new Promise((resolve, reject) => {
        
        const requestBody = {};
                
        const today = new Date();
        const sixtyDaysAgo = new Date(today);
        sixtyDaysAgo.setDate(today.getDate() - 60);
        requestBody.endDay = today.toLocaleDateString();    
        requestBody.startDay = sixtyDaysAgo.toLocaleDateString();
        requestBody.username = localStorage.getItem('userName');
        requestBody.questions = prompts;

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
                return final;
            } else {
                console.log("We had an issue ", response.status);              
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
    });           
  }, [endpoint]);

  const getAnswerForQuestion = useCallback((question) => {
    let responseText = '';
    if (userprompts.includes(question)) {        
        responseText = answers[userprompts.indexOf(question)];            
        console.log("Response is ", responseText);
    } else {
        responseText = 'Sorry, I can only answer one of the predefined questions.';
    }
    return responseText;
  }, [answers, userprompts]);

  const addResponseAndRefresh = useCallback((response) => {
    addResponseMessage(response);
    setRefresh(r=>!r);
  }, []);

  useEffect(() => {
    toggleWidget(true);
    console.log("Toggled Copilot to show");

    return () => {
      // Toggle the widget to close when the component is unmounted
      toggleWidget(false);
      console.log("Toggled Copilot to hide");
    };
  });

  useEffect(() => {
    async function fetchData() {
        const response = await getSelfCareInsights(systemprompts);
        setAnswers(response);        
    }
    deleteMessages(200);
    setQuickButtons([]);
    addResponseAndRefresh("Just a minute while copilot initializes ...");
    fetchData();
  }, [userprompts, systemprompts, getSelfCareInsights, addResponseAndRefresh]);

  useEffect(() => {
    console.log("Selected Option in Copilot got called ", selectedOption);
    if (selectedOption !== null) {        
        const responseText = getAnswerForQuestion(selectedOption);
        
        addResponseAndRefresh('Just a second...');

        // Simulate a delayed response
        const delay = 2000;
        setTimeout(() => {
            console.log("Timeout");
            deleteMessages(1);
            addResponseAndRefresh(responseText);               
        }, delay);   
    }
  }, [selectedOption, getAnswerForQuestion, addResponseAndRefresh]);

  useEffect(() => {
    console.log("IsProcessing in Copilot got called with ", isProcessing);
    
    if (!isProcessing) {           
        deleteMessages(1);
        addResponseAndRefresh("Hi " + localStorage.getItem('userName') + ". I can answer the following questions based on your self care history");        
        setQuickButtons(userprompts.map((name, index) => ({ value: name, label: name })));        
    }
  }, [isProcessing, userprompts, addResponseAndRefresh]);

  const handleNewUserMessage = (newMessage) => {
    console.log("Got message ", newMessage);
    addUserMessage(newMessage);
    setRefresh(!refresh);
    setSelectedOption(newMessage);
  }  

  return (
    <Widget
        title="Amplify Cares CoPilot"
        subtitle="Your personalized self care assistant (Beta)"
        handleNewUserMessage={handleNewUserMessage}
        isOpen={true}
        senderPlaceHolder="Type your question here..." // Set a placeholder for the input box
        handleQuickButtonClicked={(value) => handleNewUserMessage(value)}
        />              
  );
};

export default CoPilot;
