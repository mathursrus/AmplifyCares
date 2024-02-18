import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getCheckinData, getGoalID, getGoalSettingStep, isGoalCategory, saveCheckindata } from './utils/goalsUtil';
import './GoalCheckinData.css';
import { Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Confetti from "react-confetti";

function GoalCheckinData({goal}) {
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingEntry, setEditingEntry] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const [goalList, setGoalList] = useState([]);
  
  // Parse query string to determine which sections should be expanded
  const params = new URLSearchParams(location.search);
  const expandedSections = params.getAll('expanded');

  const fetchCheckinData = useCallback(async (date, list) => {
    console.log("Got date ", date, " and goal list ", list);
    getCheckinData(date).then((data) => {
      console.log("Checkin data is ", data);
      if (data && data.checkin && data.checkin.length > 0) {
        setEditingEntry(data);
        const updatedList = list.map(goal => {
          const checkinData = data.checkin.find(checkin => checkin.id === goal.id);
          if (checkinData) {
            return { ...goal, value: checkinData.value, text: checkinData.text };
          } else {
            return { ...goal, value: '', text: '' };
          }
        });
        console.log("Setting goal list to ", updatedList);
        setGoalList(updatedList);
      }
      else {
        setEditingEntry(null);
      }
    });
  }, []);

  useEffect(() => {
    if (getGoalSettingStep(goal) > 2 && goal.goals && Object.keys(goal.goals).length > 0) {
      const updatedGoals = [];
      for (const category in goal.goals) {
        //console.log("Category is ", category.toLowerCase());
        if (goal.goals.hasOwnProperty(category) && isGoalCategory(category)) {
          const categoryGoals = goal.goals[category];
          console.log("Category goals for ", category, "are ", categoryGoals);          
          categoryGoals.forEach((goal) => {            
            if (!goal.frequency) {
              goal.frequency = 'daily';
            }
            if (!goal.id) {
              goal.id = getGoalID(goal);
            }
            updatedGoals.push({id: goal.id, name: goal.goal, frequency: goal.frequency, value: '', text: ''});
          });
        }
      }
      setGoalList(updatedGoals);
      fetchCheckinData(selectedDate, updatedGoals);
    }
  }, [goal, fetchCheckinData, selectedDate]);

  const getCheckinTime = () => {            
    const date = selectedDate.toLocaleDateString();
    console.log(date);
    return date;
  };    

  // Handle input change for numerical value and text field
  const handleInputChange = (id, key, value) => {
    const updatedGoals = goalList.map(goal => {
        if (goal.id === id) {
            return { ...goal, [key]: value };
        }
        return goal;
    });
    setGoalList(updatedGoals);
  };

  const celebrateNow = async () => {                                
    setCelebrate(true);
    
    setTimeout(() => {
        setCelebrate(false);        
    }, 6000);
  }

  // Save goal checkin data
  const handleCheckin = () => {
    // Perform saving logic here
    console.log('Goal checkin data:', goalList);
    // Filter goals with non-empty values
    const goalsWithValues = goalList.filter(goal => goal.value || goal.text);

    if (goalsWithValues.length === 0 && !editingEntry) {
        alert('No goals have checkin data. Please enter checkin data for at least one goal.');
        return;
    }
    // Construct checkin property
    const checkin = goalList.map(goal => ({
        id: goal.id,
        value: goal.value,
        text: goal.text
    }));

    const itemData = {
        name: localStorage.getItem('userName'),
        DateTime: getCheckinTime(),
        lastEdited: new Date(),
        checkin: checkin
    };

    if (editingEntry && editingEntry._id) {
        itemData._id = editingEntry._id;
        itemData.DateTime = editingEntry.DateTime;
    }

    // Save updated itemData to localStorage or perform other operations
    console.log('Saving checkin:', itemData);
    saveCheckindata(itemData).then((data) => {
        fetchCheckinData(selectedDate, goalList);
        celebrateNow();
    });
  };

  return (
    <div className='goal-checkin-container'>    
      <center>
        <DatePicker
            selected={selectedDate}
            onChange={(date) => {console.log("Selected date ", date); setSelectedDate(date)}}
            dateFormat="MM/dd/yyyy"
            className="date-picker"
        />
        <br></br>
        <br></br>
      </center>  
      <div className='goal-checkin-container'>
        {goalList.map((goal, index) => (
            <div className='goal-checkin-data' key={index}>
                <label className='goal-name'>
                    {expandedSections.includes(goal.frequency) && (                
                        <span className='red' title='Due for checkin'>*</span>
                    )}
                    <span>
                        {goal.name}
                    </span>                                                            
                </label>
                <input
                    className='goal-value'
                    type="number"
                    placeholder='Goal progress (number)...'
                    value={goal.value}
                    onChange={(e) => handleInputChange(goal.id, 'value', e.target.value)}
                />
                <input
                    className='goal-text'
                    type="text"
                    placeholder='Notes for your recollection'
                    value={goal.text}
                    onChange={(e) => handleInputChange(goal.id, 'text', e.target.value)}
                />
            </div>
        ))}
      </div>
      <Button className='complete' onClick={handleCheckin}><b>{editingEntry?'Update':'Complete'} Checkin</b></Button>
      {celebrate  && 
        <Confetti gravity={0.2} width={window.width} height={window.height}/>
      } 
    </div>
  );
}

export default GoalCheckinData;
