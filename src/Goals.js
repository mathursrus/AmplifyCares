import { React, useState, useEffect} from 'react';
import GoalCategory from './GoalCategory';
import './Goals.css';
import Identity from './Identity.js';
import { Button, Accordion, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCheckDouble, faEdit } from '@fortawesome/free-solid-svg-icons';
import Confetti from "react-confetti";
import GoalCheckin from './GoalCheckin.js';
import { getGoalSettingStep, getUserGoals, saveUserGoals } from './utils/goalsUtil.js';
import {sendPushNotification} from './utils/notificationsUtil.js';
import GoalCheckinData from './GoalCheckinData.js';

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
  const [editMode, setEditMode] = useState(true);

  useEffect(() => {
    fetchAndSetUserGoals();
  }, []);

  const fetchAndSetUserGoals = async () => {
    try {
      const value = await getUserGoals();
      if (value) {
          const goalSettingStep = getGoalSettingStep(value);                    
          console.log("Setting step to ", goalSettingStep, " and goals to ", value);
          if (goalSettingStep > 3) {
            setEditMode(false);
          }
          setGoalSettingStep(goalSettingStep);
          setCurrentStep(goalSettingStep);
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
      if (window.confirm("You need to identify your best self before proceeding to goal setting. Are you sure you want to proceed?")) {
        saveGoals();
      }
    }
  }

  const completeStep2 = () => {
    if (Object.values(userGoals.goals).some((array) => array.length > 0 && array[0].goal && array[0].goal !== '')) {
      setCurrentStep(3); 
      setGoalSettingStep(3);
      saveGoals();
    }
    else {
      if (window.confirm("You need to set at least 1 goal you want to target in your self care journey. Are you sure you want to proceed?")) {
        saveGoals();
      }
    }
  }

  const completeStep3 = () => {
    if (userGoals.goals.dailyCheckinInfo || userGoals.goals.weeklyCheckinInfo || userGoals.goals.monthlyCheckinInfo) {
      saveGoals();
      //seekNotificationPermission();
      sendPushNotification("Rock your self care goals!", 
        "This is what your checkin reminder will look like.",
        "goals");
    }
    else {
      alert("No checkin info set. You will not be reminded to checkin on your goals.");        
    }
  }

  const celebrate = () => {
    setAnimation(true);
            
    setTimeout(() => {
        setAnimation(false);        
    }, 3000);    
  }

  const saveGoals = () => {
    console.log("Saving goal ", userGoals);
    saveUserGoals(userGoals).then((response) => {
      fetchAndSetUserGoals();
    });
    celebrate();   
  }

  return (
    <div>
      {userGoals ? (        
        <div className="goal-page">
          <div className='title'>          
            <span>
              {editMode? "Your journey towards a better version of yourself starts with these 3 simple steps":
                          "Checkin and track your self care goals. You are doing great!"}                          
            </span>
            <a className="switch-mode" 
              href="a" onClick={(e)=>{
                e.preventDefault(); // Prevent default anchor link behavior
                setEditMode(!editMode);
              }}>
                {editMode? (goalSettingStep > 2 ? 
                  <FontAwesomeIcon icon={faCheckDouble} title='Goal Checkin' />: ''): 
                  <FontAwesomeIcon icon={faEdit} title='Edit Goals' />
                }
            </a>
          </div>      
          {!editMode ? (
            <GoalCheckinData goal={userGoals} />
          ) : (
          <div>
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
              <Accordion.Collapse eventKey="3">
                <Card.Body>
                  {goalSettingStep > 2 && (
                    <GoalCheckin goals={userGoals.goals}/>
                  )}
                  {/*
                  */                  
                  <Button className="next-step" onClick={() => completeStep3()}><b>Rock on. Hit this button and observe the notification that will keep you accountable.</b></Button>                  
                  }                  
                </Card.Body>
              </Accordion.Collapse>
            </Accordion.Item>
          </Accordion>

          {animation && (
            <Confetti width={window.width} height={window.height}/>
          )}
          
        </div>
        )}
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
