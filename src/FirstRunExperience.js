import React, { useState } from 'react';
import './FirstRunExperience.css'; 

function FirstRunExperience({ onClose }) {
  const [currentScreen, setCurrentScreen] = useState(1);

  // Function to handle navigating to the next screen
  const handleNextScreen = () => {
    setCurrentScreen((prevScreen) => prevScreen + 1);
  };

  // Function to handle navigating to the previous screen
  const handlePreviousScreen = () => {
    setCurrentScreen((prevScreen) => prevScreen - 1);
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    onClose();
  };

  // Define the content for each screen
  const screens = [
    {
      title: 'Welcome to Amplify Cares',
      content: (
        <div>
          We have a hypothesis. That self care is the foundation of everything we do, every success we set out to achieve. We have a hypothesis that when we normalize and encourage self-care, we will be a better team.
          {/* Embedded video for the first screen */}
          {/* Add your video component here */}
        </div>
      ),
    },
    {
      title: 'What can Amplify Cares do for you?',
      content: (
        <div>
          Have you ever wanted to meditate, exercise, pray, volunteer, do other things to take care of yourself and others, but didn't know where to start? Have you ever wanted to share your self-care techniques with others? That is what Amplify Cares can do for you.
          {/* Embedded video for the second screen */}
          {/* Add your video component here */}
        </div>
      ),
    },
    {
      title: "What's New",
      content: (
        <div>
          Stay tuned for regular announcements of new features added to promote your self-care.
          {/* Scrollable multiple rows each with a video tile and text */}
          {/* Add your content for the third screen here */}
        </div>
      ),
    },
  ];

  // Get the current screen content based on the currentScreen state
  const currentScreenContent = screens[currentScreen - 1];

  return (
    <div className="fre-container">
      <div className="fre-content">
        <span className="close" onClick={handleCloseModal}>
          &times;
        </span>
        <div className="screen-container">
          <h3>{currentScreenContent.title}</h3>
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
