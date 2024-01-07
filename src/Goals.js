import { React, useState, useEffect} from 'react';
import GoalCategory from './GoalCategory';
import './Goals.css';
import Identity from './Identity.js';
import { fetchWithToken, getApiHost, postWithToken } from './utils/urlUtil.js';
import { Button } from 'react-bootstrap';

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

  useEffect(() => {
    fetchUserGoals();
  }, []);

  const fetchUserGoals = async () => {
    try {
      const response = await fetchWithToken(getApiHost()+`/getusergoals/?item=${localStorage.getItem('userName')}`, localStorage.getItem('usertoken'));
      if (response.ok) {
          const data = await response.json();
          const final = JSON.parse(data);
          console.log("Got user goals ", final);
          setUserGoals(final.length>0?final[0]:{});
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
    console.log("User goals object is ", userGoals);
    //console.log("User goals identity is ", userGoals.identity);
  }

  const saveGoals = () => {
    if (userGoals.identity && userGoals.identity !== '') {
      console.log("Saving goal ", userGoals);
      postWithToken('/writeusergoals', userGoals, localStorage.getItem('usertoken'));
    }
    else {
      alert("Please complete Step 1 to start your journey");
    }
  }

  return (
    <div>
      {userGoals ? (
        <div className="goal-page">
          <center><h4>Your journey towards a better version of yourself starts with these 3 steps</h4></center>
          <span className='instruction'>Step 1: How would you descibe your "best self"? </span>
          <Identity userGoals={userGoals} /><br></br>
          <span className='instruction'>Step 2: What goals and habits will get you there?  </span>
          {categories.map(category => (
            <GoalCategory 
              key={category} 
              name={category} 
              goals={userGoals.goals?userGoals.goals[category]:userGoals.goals}
              updateGoals={(goals) => {updateGoals(category, goals)}}
              wellKnownHabitsToAdopt={wellKnownHabitsToAdopt[category]} 
              wellKnownHabitsToShed={wellKnownHabitsToShed[category]}/>
          ))}
          <center>
            <Button className="save-goals" onClick={saveGoals}><b>Save Goals</b></Button>
          </center>
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
