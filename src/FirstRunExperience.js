import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faStar, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './FirstRunExperience.css'; 

export const features = [
  {
    date: "2/24/2023",
    title:"Goals and Habits",
    description: "Goal setting and habit tracking are now available. Set your self care goals and track your habits. Click on the <a href='/goals'>Goals</a> page to get started.",
  },
  {
    date: "11/26/2023",
    title:"Daily 2 minute self care challenges",
    description: "Make self care a habit by taking the 2 minute self care challenge. Just join the <a href='?showHabits=5&habit=6562f3469555c41088f0b93c'>self care circle</a>, click on + every day and make self care a habit.",
  },
  {
    date: "11/12/2023",
    title:"Join Circles and collaborate on self care",
    description: "Click on the <img src='./info_icon.png' width=20px></img> icon on the Submit Time page and join your colleagues in their self care activities",
  },
  {
    date: "9/27/2023",
    title:"Personalized Self Care Insights (Beta)",
    description: "Powered by GPT and your personal self care data, you can get insights into your self care routine, ideas on what you can do with other team members, and a lot more! Simply click on the copilot icon on the summary page. Happy self care!",
  },
  {
    date: "9/18/2023",
    title:"Talk to Amplify Cares",
    description: "Powered by OpenAI Speech to Text and GPT, you can use the mic icon (on the Submit page) to tell Amplify Cares what you did for self care. Easy?",
  },
  {
      date: "9/13/2023",
      title:"Gain inspiration for self care",
      description: "Self Care Stats now shows a wordcloud view of your common activities and those of others (in aggregate) so you can be inspired to build new self care habits",
  },
  {
      date: "9/1/2023",
      title:"Now available as a Teams app",
      description: "@Satish - Thank you for pushing for a Teams app. You can now sideload the Teams app at <a href='http://aka.ms/AmplifyCaresTeamsApp' target='_blank' rel='noopener noreferrer'>aka.ms/AmplifyCaresTeamsApp</a> by following these instructions <a href='https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/deploy-and-publish/apps-upload' target='_blank' rel='noopener noreferrer'>here</a>",
  },
  {
      date: "8/30/2023",
      title:"Entering historical data",
      description:"@Manohar @ScottHas - Thank you for expressing the need to enter historical data. You can now pick the date for your self care hours.",
  },
  {
      date: "8/15/2023",
      title:"No more screaming",
      description:"@Jesus - Thank you for telling us that you felt screamed at by the SubmitTime page. We've mellowed down thanks to you.",
  },
  {
      date: "7/15/2023",
      title:"Cold Start Performance",
      description:"@ScottHas - Thank you for your feedback on the terrible perf at first boot. We've reduced cold start perf from 40 seconds to 1 second. Your feedback helped improve the experience for all.",
  }
];

/*const comingsoon = [
  {
      title:"Accessibility",
      description:"@Maggie - Thank you for calling out that the color scheme is not accessible. We will work on fixing this soon.",
  },
  {
    title:"Personalized Insights to help your self care",
    description:"Learn from what others do well. Amplify Cares will give you suggestions on what you can do to take even better care of yourself.",
  },
  {
    title:"Challenges to keep you going",
    description:"Think you're doing a great job of self care? Beat the challenges and prove it to yourself.",
  },
];*/

function FirstRunExperience({ screen, onClose }) {
  const [currentScreen, setCurrentScreen] = useState(screen);

  // Function to handle closing the modal
  const handleCloseModal = () => {
    onClose();
  };

  const handleScreenChange = (screen) => {
    console.log("Changing screen to ", screen);
    setCurrentScreen(screen);
  };

  useEffect(() => {
    // Code to update the video source when activeScreenIndex changes
    const videoElement = document.getElementById('video-element');
    if (videoElement) videoElement.load();
  }, [currentScreen]);

  // Define the content for each screen
  const screens = [
    {
      title: 'Want to be your best self?',
      /*content: 
        <div>
          We have a <a href="https://microsoft-my.sharepoint-df.com/:w:/p/sidm/ES-DIlQMHbJEgLz9cLSRcSsBdieBfDoaM-r5-cAjWcBwMw?e=hPhdPs" target="_blank" rel="noreferrer">hypothesis</a>. 
          That self care is the foundation of everything we do, 
          every success we set out to achieve. 
          We have a hypothesis that when we normalize and encourage self-care, 
          we will be a better team. Watch the video to learn more ...

          <br></br><br></br>
          <center><video id="video-element" controls>
            <source src="/Why.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video></center>
        </div>
      ,*/
      content: (
        <div>
          <h6><i>Invest in your self care. </i></h6>          
          <br></br>
          You're not alone. Join your friend and colleagues. Start simple.
          <br></br>
          <br></br>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{fontSize: '12px'}}>1. Join a self-care circle you like </span>
              <img src="/self-care-circles.png" width="200 px" alt="Circles" />              
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{fontSize: '12px'}}>2. Sign up for a daily challenge</span>
              <img src="/daily-challenge.png" width="100 px" alt="Challenge" />              
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>            
              <span style={{fontSize: '12px'}}>3. Get your personalized coach</span>
              <img src="/self-care-coach.png" width="200 px" alt="Coach" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Know how to get there?',
      content: (
        <div>
          <h6><i>Make self care a habit</i></h6>          
          <br></br>
          Need some guidance? No problem. Baby steps will get you there.
          <br></br>
          <br></br>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{fontSize: '12px'}}>1. Set your goals, pick your habits </span>
              <img src="/set-goals.png" width="300 px" alt="Circles" />              
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{fontSize: '12px'}}>2. Get coaching on picking habits</span>
              <img src="/goals-coach.png" width="300 px" alt="Challenge" />              
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>            
              <span style={{fontSize: '12px'}}>3. Time and track your habits daily</span>
              <img src="/track-time.png" width="300 px" alt="Coach" />
            </div>
          </div>
        </div>
      ),
    },
      /*title: 'What can Amplify Cares do for you?',
      content: (
        <div>
          Have you ever wanted to meditate, exercise, pray, volunteer, 
          do other things to take care of yourself and others? 
          Have you ever felt guilty taking time for self care? 
          Have you ever wanted to share your self-care techniques with others? 
          Amplify Cares promotes, normalizes, gamifies the essential habit of self care. 
          Watch the video to learn more ...
                     
          <br></br><br></br>
          <center><video id="video-element" controls>
            <source src="/what.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video></center>
        </div>
      ),
    },*/
    {
      title: 'Need Help Staying Inspired?',
      content: (
        <div>
          <h6><i>See yourself improve, See your team improve</i></h6>          
          <br></br>
          What inspires you? Self improvement? Competition? Collaboration? You got it. 
          <br></br>
          <br></br>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{fontSize: '12px'}}>1. Watch yourself get better </span>
              <img src="/inspire-self.png" width="300 px" alt="Circles" />              
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{fontSize: '12px'}}>2. Watch teams get better</span>
              <img src="/inspire-competition.png" width="300 px" alt="Challenge" />              
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>            
              <span style={{fontSize: '12px'}}>3. Watch others get better</span>
              <img src="/inspire-collab.png" width="300 px" alt="Coach" />
            </div>
          </div>
        </div>
      ),
      /*title: "What's new for you in Amplify Cares",
      content: (
        <div>
          <i>We're constantly improving Amplify Cares, so you can constantly improve your self care. Keep the feedback coming.</i>
          <br></br><br></br><br></br>
          {features.map((feature, index) => (
            <div className="feature-row">                
                <div className="featuretext-container">
                {(new Date(feature.date) > new Date(localStorage.getItem('lastLogin'))) && (
                  <FontAwesomeIcon icon={faStar} style={{ color: 'gold', marginRight: '5px' }} />
                )}
                    <b>{feature.date}: {feature.title}</b>
                    <p dangerouslySetInnerHTML={{ __html: feature.description }} />
                </div>
            </div>
          ))}                 
        </div>
      ),*/
    },
    {
      title: 'Ready to get started?',
      content: (
        <div>
          <h6><i>Start where you want</i></h6>          
          <br></br>          
          <br></br>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              1.<a href="/goals" style={{fontSize: '12px'}} onClick={handleCloseModal}>Set Goals </a>                            
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              2.<a href="/submit-time-page" style={{fontSize: '12px'}} onClick={handleCloseModal}>Track Time</a>                         
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>            
              3.<a href="/leaderboard" style={{fontSize: '12px'}} onClick={handleCloseModal}>Leaderboard</a>              
            </div>
          </div>
        </div>
      ),
      /*title: "Coming soon to Amplify Cares",
      content: (
        <div>
          <i>We're constantly improving Amplify Cares, so you can constantly improve your self care. Keep the feedback coming.</i>
          <br></br><br></br><br></br>
          {comingsoon.map((feature, index) => (
            <div className="feature-row">                
                <div className="featuretext-container">
                    <b>{feature.title}</b>
                    <p>{feature.description}</p>
                </div>
            </div>
          ))}          
        </div>
      ),*/
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
        {currentScreen > 1 && (
        <FontAwesomeIcon
          icon={faChevronLeft}
          className="scroll-indicator"
          onClick={(e) => handleScreenChange(currentScreen-1)}
          style={{ left: 0 }}
        />
        )}
        {currentScreen < screens.length && (
        <FontAwesomeIcon
          icon={faChevronRight}
          className="scroll-indicator"
          onClick={() => handleScreenChange(currentScreen + 1)}
          style={{ right: 0 }}
        />
        )}
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
