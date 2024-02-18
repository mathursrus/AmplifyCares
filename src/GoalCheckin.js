
import React, { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { DesktopTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getGoalID, isGoalCategory } from './utils/goalsUtil';
import './GoalCheckin.css';
import dayjs from 'dayjs';

function GoalCheckin({goals}) {
  const [goalList, setGoalList] = useState([]);
  const [refreshValue, setRefreshValue] = useState(1);

  useEffect(() => {
    if (goals && Object.keys(goals).length > 0) {
      if (!goals.dailyCheckinInfo) {
        goals.dailyCheckinInfo = {time : '9:00'};
      }
      if (!goals.weeklyCheckinInfo) {
        goals.weeklyCheckinInfo = {day : 'Monday', time : '09:00'};
      }
      if (!goals.monthlyCheckinInfo) {  
        goals.monthlyCheckinInfo = {day:'Last', time : '09:00'};
      }
      //console.log("Goals are ", goals);
      const updatedGoals = [];
      for (const category in goals) {
        //console.log("Category is ", category.toLowerCase());
        if (goals.hasOwnProperty(category) && isGoalCategory(category)) {
          const categoryGoals = goals[category];
          //console.log("Category goals for ", category, "are ", categoryGoals);          
          categoryGoals.forEach((goal) => {            
            if (!goal.frequency) {
              goal.frequency = 'daily';
            }
            if (!goal.id) {
              goal.id = getGoalID(goal);
            }
            updatedGoals.push(goal);
          });
        }
      }
      setGoalList(updatedGoals);
    }
  }, [goals]);

  const onDragEnd = (result) => {
    const { draggableId, source, destination } = result;
    // Check if the item was dropped over a droppable
    if (destination) {
      const draggedGoal = goalList.find(goal => goal.id === draggableId);
      if (source.droppableId !== destination.droppableId) {
        // Item was dropped into a different droppable
        draggedGoal.frequency = destination.droppableId;        
        console.log("Updated goal ", draggedGoal);
        // Update the state to reflect the change
        setGoalList([...goalList]);
      }
    }
  };

  return (
    goalList.length > 0 && refreshValue > 0 && (
      <DragDropContext onDragEnd={onDragEnd}>
      <span className='goal-checkin-header'>Goal checkins are a good way to track progress in your self care journey. Checkin often - how often depends on the goal. Drag and Drop your goals into the appropriate box.</span>
      <div className="goal-checkin">
        Never - I will magically achieve these without checking in
        <Droppable droppableId="never">
            {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className='goal-container'>
              {goalList.map((goal, index) => (
                goal.frequency === 'never' && (
                <Draggable key={goal.frequency+index} draggableId={goal.id} index={index}>
                  {(provided) => (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      className="goal"
                    >
                      <div>{goal.goal}</div>
                    </div>
                  )}
                </Draggable>
                )
              ))}
              {provided.placeholder}            
            </div>
          )}
        </Droppable>
      </div>
      <div className="goal-checkin">
        Daily - I commit to check in every day at
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopTimePicker
              value={dayjs("2024T"+goals.dailyCheckinInfo.time)}
              onAccept={(value) => {goals.dailyCheckinInfo.time = value.format('HH:mm'); setRefreshValue(refreshValue+1)}}
            />
          </LocalizationProvider>
        <Droppable droppableId="daily">  
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className='goal-container'>
              {goalList.map((goal, index) => (
                goal.frequency === 'daily' && (
                <Draggable key={goal.frequency+index} draggableId={goal.id} index={index}>
                  {(provided) => (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      className="goal"
                    >
                      <div>{goal.goal}</div>
                    </div>
                  )}
                </Draggable>
                )
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
      <div className="goal-checkin">
        Weekly - I commit to check in every 
          <select value={goals.weeklyCheckinInfo.day} className='day-of-week-combo'
            onChange={(event) => {goals.weeklyCheckinInfo.day = event.target.value; setRefreshValue(refreshValue+1)}}>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
        at 
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopTimePicker
              value={dayjs("2024T"+goals.weeklyCheckinInfo.time)}
              onAccept={(value) => goals.weeklyCheckinInfo.time = value.format('HH:mm')}
            />
          </LocalizationProvider>     
        <Droppable droppableId="weekly">      
        {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className='goal-container'>
              {goalList.map((goal, index) => (
                goal.frequency === 'weekly' && (
                <Draggable key={goal.frequency+index} draggableId={goal.id} index={index}>
                  {(provided) => (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      className="goal"
                    >
                      <div>{goal.goal}</div>
                    </div>
                  )}
                </Draggable>
                )
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
      <div className="goal-checkin">
        Monthly - I commit to check in every month on the
          <select value={goals.monthlyCheckinInfo.day} className='day-of-week-combo'
            onChange={(event) => {goals.monthlyCheckinInfo.day = event.target.value; setRefreshValue(refreshValue+1)}}>
            <option value="First">First Day</option>
            <option value="Last">Last Day</option>          
          </select>  
        at
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopTimePicker
              value={dayjs("2024T"+goals.monthlyCheckinInfo.time)}
              onAccept={(value) => goals.monthlyCheckinInfo.time = value.format('HH:mm')}
            />
          </LocalizationProvider>
        <Droppable droppableId="monthly">      
        {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className='goal-container'>
              {goalList.map((goal, index) => (
                goal.frequency === 'monthly' && (
                <Draggable key={goal.frequency+index} draggableId={goal.id} index={index}>
                  {(provided) => (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      className="goal"
                    >
                      <div>{goal.goal}</div>
                    </div>
                  )}
                </Draggable>
                )
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
    )
  );
}

export default GoalCheckin;
