import React, { useState, useEffect } from 'react';
import './FirstRunExperience.css'; 

function FirstRunExperience({ screen, onClose }) {
  const [currentScreen, setCurrentScreen] = useState(screen);

  // Function to handle closing the modal
  const handleCloseModal = () => {
    onClose();
  };

  useEffect(() => {
    // Code to update the video source when activeScreenIndex changes
    const videoElement = document.getElementById('video-element');
    if (videoElement) videoElement.load();
  }, [currentScreen]);

  const features = [
    {
        title:"No more screaming",
        description:"@Jesus - Thank you for telling us that you felt screamed at by the SubmitTime page. We've mellowed down thanks to you.",
    },
    {
        title:"Pop-up blocker warning",
        description:"@Sarah - You brought it to our attention that authentication appeared to be stuck if browser pop-up blockers weren't turned off. We have now updated the authenticating message to make this step clearer. Thank you! ",
    },
    {
        title:"Cold Start Performance",
        description:"@ScottHas - Thank you for your feedback on the terrible perf. We've reduced cold start perf from 40 seconds to 1 second. Hope you find it better now.",
    }
  ];

  const comingsoon = [
    {
        title:"Entering historical data",
        description:"@Manohar - Thank you for expressing the need to enter historical data. We've added this feature to the roadmap.",
    },
    {
        title:"Accessibility",
        description:"@Maggie - Thank you for calling out that the color scheme is not accessible. We will work on fixing this soon.",
    },
  ];

  // Define the content for each screen
  const screens = [
    {
      title: 'Welcome to Amplify Cares',
      content: 
        <div>
          We have a <a href="https://microsoft-my.sharepoint-df.com/:w:/p/sidm/ES-DIlQMHbJEgLz9cLSRcSsBdieBfDoaM-r5-cAjWcBwMw?e=hPhdPs" target="_blank" rel="noreferrer">hypothesis</a>. 
          That self care is the foundation of everything we do, 
          every success we set out to achieve. 
          We have a hypothesis that when we normalize and encourage self-care, 
          we will be a better team. Watch the video to learn more ...

          <br></br><br></br>
          <center><video id="video-element" controls>
            <source src="/welcome.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video></center>
        </div>
      ,
    },
    {
      title: 'What can Amplify Cares do for you?',
      content: (
        <div>
          Have you ever wanted to meditate, exercise, pray, volunteer, 
          do other things to take care of yourself and others? 
          Have you ever felt guilty taking time for self care? 
          Have you ever wanted to share your self-care techniques with others? 
          Amplify Cares promotes, normalizes, gamifies the essential habit of self care. 
          Amplify Cares, Do you?
                     
          <br></br><br></br>
          <center><video id="video-element" controls>
            <source src="/what.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video></center>
        </div>
      ),
    },
    {
      title: "What's new for you in Amplify Cares?",
      content: (
        <div>
          We're constantly improving Amplify Cares, so you can constantly improve your self care. Keep the feedback coming.
          <br></br><br></br>
          {features.map((feature, index) => (
            <div className="feature-row">
                {/*
                <div className="video-thumbnail">
                    <video controls>
                    <source src={feature.videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                    </video>
                </div>
              */}
                <div className="featuretext-container">
                    <b>{feature.title}</b>
                    <p>{feature.description}</p>
                </div>
            </div>
          ))}                 
        </div>
      ),
    },
    {
      title: "Coming soon to Amplify Cares",
      content: (
        <div>
          We're constantly improving Amplify Cares, so you can constantly improve your self care. Keep the feedback coming.
          <br></br><br></br>
          {comingsoon.map((feature, index) => (
            <div className="feature-row">                
                <div className="featuretext-container">
                    <b>{feature.title}</b>
                    <p>{feature.description}</p>
                </div>
            </div>
          ))}          
        </div>
      ),
    },
  ];

  // Get the current screen content based on the currentScreen state
  const currentScreenContent = screens[currentScreen - 1];

  return (
    <div className="fre-container">
      <div className="fre-content">
        <span className="close-button" onClick={handleCloseModal}>
          &times;
        </span>
        <div className="screen-container">
          <h4>{currentScreenContent.title}</h4>
          {currentScreenContent.content}
        </div>
        <div className="dot-container">
          {/* Render navigation dots */}
          {screens.map((screen, index) => (
            <span
              key={index}
              className={index === currentScreen - 1 ? 'dot-active' : 'dot'}
              onClick={() => setCurrentScreen(index+1)}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FirstRunExperience;
