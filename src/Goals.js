import { React, useState, useEffect} from 'react';
import GoalCategory from './GoalCategory';
import './Goals.css';
import Identity from './Identity.js';
import { Button, Accordion, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Confetti from "react-confetti";
//import GoalCheckin from './GoalCheckin.js';
import { getUserGoals, saveUserGoals } from './utils/goalsUtil.js';
import {seekNotificationPermission, sendPushNotification} from './utils/notificationsUtil.js';

const categories = ['Mental', 'Physical', 'Spiritual', 'Social'];

const wellKnownHabitsToAdopt = {
  'Mental':['meditation', 'learning', 'chanting', 'deep breathing', 'journaling', 'reading'],
  'Physical': ['exercise', 'sports', 'doctor visit', 'yoga', 'dog walking'],
  'Spiritual': ['prayers', 'religious activities'],
  'Social': ['volunteering', 'team lunch', 'mentoring', 'family time', 'friends time'],
};

const wellKnownHabitsToShed = {
  'Mental':['tv time'],
  'Physical': ['coffee'],
  'Spiritual': ['bad books'],
  'Social': ['lunch at desk'],
};

function Goals() {

  const [userGoals, setUserGoals] = useState(null);
  const [goalSettingStep, setGoalSettingStep] = useState(1); // How far along is the user in goal setting
  const [currentStep, setCurrentStep] = useState(1); // How far along is the user in goal setting
  const [animation, setAnimation] = useState(false);

  useEffect(() => {
    fetchAndSetUserGoals();
  }, []);

  const fetchAndSetUserGoals = async () => {
    try {
      const value = await getUserGoals();
      if (value) {          
          const step1complete = (value.identity && value.identity !== '');
          const step2complete = (value.goals && Object.values(value.goals).some((array) => array.length > 0 && array[0].goal && array[0].goal !== ''));
          const step3complete = step2complete;
          const goalSettingStep = (step1complete && step2complete && step3complete)?4:
                                    (step1complete && step2complete)? 3: 
                                      (step1complete? 2:1);
          console.log("Setting step to ", goalSettingStep, " and goals to ", value);
          setGoalSettingStep(goalSettingStep);
          setUserGoals(value);
      }
    } catch (error) {
        console.error('Error fetching entries:', error);
        setUserGoals({});
    }
  };

  const updateGoals = (category, goals) => {
    if (!userGoals.goals || userGoals.goals === null) {
      userGoals.goals = {};
    }
    userGoals.goals[category] = goals;
    //console.log("User goals object is ", userGoals);
    //console.log("User goals identity is ", userGoals.identity);
  }

  const completeStep1 = () => {      
    if (userGoals.identity && userGoals.identity !== '') {
      setCurrentStep(2); 
      setGoalSettingStep(2);
      saveGoals();
    }
    else {
      alert("Please identify your best self before proceeding to goal setting");
    }
  }

  const completeStep2 = () => {
    if (Object.values(userGoals.goals).some((array) => array.length > 0 && array[0].goal && array[0].goal !== '')) {
      setCurrentStep(3); 
      setGoalSettingStep(3);
      saveGoals();
    }
    else {
      alert("Please set at least 1 goal you want to target in your self care journey");
    }
  }

  const completeStep3 = () => {
    seekNotificationPermission();
    sendPushNotification("Sids notification", "This is a test.");
  }

  const celebrate = () => {
    setAnimation(true);
            
    setTimeout(() => {
        setAnimation(false);        
    }, 3000);    
  }

  const saveGoals = () => {
    console.log("Saving goal ", userGoals);
    saveUserGoals(userGoals);
    celebrate();   
  }

  return (
    <div>
      {userGoals ? (
        <div className="goal-page">
        <div>
          <center><h4>Your journey towards a better version of yourself starts with these 3 simple steps</h4></center>      
          <br></br>
          {/*goalSettingStep === 0 && (
            <Button className="next-step" onClick={() => {setCurrentStep(1); setGoalSettingStep(1)}}><b>Ready to Start?</b></Button>            
          )*/}
          <Accordion activeKey={currentStep.toString()} onSelect={(key) => setCurrentStep(parseInt(key))}>
            <Accordion.Item eventKey="1">
              <Accordion.Header>
                <span className='instruction'>
                  Step 1: How would you describe your "ideal self"? (This is the person you want to become) 
                  {goalSettingStep > 1 && (
                    <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'green' }} />
                  )}
                  {/*goalSettingStep === 0 && ( <i> Click the button to get started </i>)*/}
                </span>                
              </Accordion.Header>
              {goalSettingStep > 0 && (
              <Accordion.Collapse eventKey="1">
                <Card.Body>
                  <Identity userGoals={userGoals} />                  
                    <Button className="next-step" onClick={() => completeStep1()}><b>Save and set goals towards becoming your ideal self</b></Button>                  
                </Card.Body>
              </Accordion.Collapse>
              )}
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>
                <span className='instruction'>
                  Step 2: How will you get there? (These are the goals and habits that will power you) 
                  {goalSettingStep > 2 && (
                    <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'green' }} />
                  )}
                </span>
              </Accordion.Header>
              {goalSettingStep > 1 && (
              <Accordion.Collapse eventKey="2">
                <Card.Body>
                  {categories.map(category => (
                    <GoalCategory
                      key={category}
                      name={category}
                      goals={userGoals.goals ? userGoals.goals[category] : userGoals.goals}
                      updateGoals={(goals) => { updateGoals(category, goals) }}
                      wellKnownHabitsToAdopt={wellKnownHabitsToAdopt[category]}
                      wellKnownHabitsToShed={wellKnownHabitsToShed[category]}
                    />
                  ))}                  
                  <Button className="next-step" onClick={() => completeStep2()}><b>Happy with goals and ready to move to the final step?</b></Button>                  
                </Card.Body>
              </Accordion.Collapse>
              )}
            </Accordion.Item>

            <Accordion.Item eventKey="3">
              <Accordion.Header>
                <span className='instruction'>
                  Step 3: How will you know you are succeeding? (This is how you will hold yourself accountable) 
                  {goalSettingStep > 3 && (
                    <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'green' }} />
                  )}
                </span>
              </Accordion.Header>
              {goalSettingStep > 2 && (
              <Accordion.Collapse eventKey="3">
                <Card.Body>
                  {/*
                  <GoalCheckin />*/                  
                  <Button className="next-step" onClick={() => completeStep3()}><b>Coming soon ....</b></Button>                  
                  }                  
                </Card.Body>
              </Accordion.Collapse>
              )}
            </Accordion.Item>
          </Accordion>

          {animation && (
            <Confetti width={window.width} height={window.height}/>
          )}
          
        </div>
        </div>      
      ):(
        <div>
          <br></br>
          <center>Loading ...</center>
        </div>
      )
      }
    </div>
  );
}

export default Goals;
