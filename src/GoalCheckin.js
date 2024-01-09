import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { DesktopTimePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function GoalCheckin({usergoals}) {
  const [goals, setGoals] = useState([
    { name: 'Goal 1', frequency: 'daily', specific: '12:00' },
    { name: 'Goal 2', frequency: 'weekly', specific: { dayOfWeek: 'Monday', time: '09:00' } },
    { name: 'Goal 3', frequency: 'monthly', specific: { dayOfMonth: new Date(), time: '15:30' } },
  ]);

  const handleFrequencyChange = (index, event) => {
    const updatedGoals = [...goals];
    updatedGoals[index].frequency = event.target.value;
    setGoals(updatedGoals);
  };

  const handleSpecificChange = (index, value) => {
    const updatedGoals = [...goals];
    updatedGoals[index].specific = value;
    setGoals(updatedGoals);
  };

  return (
    <div className="goal-checkin">
      How often will you checkin on goal progress?
      <table>
        <thead>
          <tr>
            <th>Goal Name</th>
            <th>Frequency</th>
            <th>Specific</th>
          </tr>
        </thead>
        <tbody>
          {goals.map((goal, index) => (
            <tr key={index}>
              <td>{goal.name}</td>
              <td>
                <select
                  value={goal.frequency}
                  onChange={(event) => handleFrequencyChange(index, event)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </td>
              <td>
                {goal.frequency === 'daily' && (
                  <div className="daily-checkins">
                    <span class="checkin-text">Time of Day:</span>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>                  
                      <DesktopTimePicker
                          value={goal.specific}
                          onChange={(value) => handleSpecificChange(index, value)}
                        />
                    </LocalizationProvider>
                  </div>
                )}
                {goal.frequency === 'weekly' && (
                  <div>
                  <div className="daily-checkins">      
                    <span class="checkin-text">Day of Week:</span>            
                    <select class="dayofweek"
                      value={goal.specific.dayOfWeek}
                      onChange={(event) => handleSpecificChange(index, { ...goal.specific, dayOfWeek: event.target.value })}
                    >
                      <option value="Sunday">Sunday</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>                    
                      <option value="Saturday">Saturday</option>
                    </select>
                  </div>
                  <div className="daily-checkins">
                    <span class="checkin-text">Time of Day:</span>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>                  
                      <DesktopTimePicker
                          value={goal.specific}
                          onChange={(value) => handleSpecificChange(index, value)}
                        />
                    </LocalizationProvider>
                  </div>
                  </div>
                )}
                {goal.frequency === 'monthly' && (
                  <div>
                  <div className="daily-checkins">      
                    <span class="checkin-text">Day of Month:</span>            
                    <select class="dayofweek"
                      value={goal.specific.dayOfWeek}
                      onChange={(event) => handleSpecificChange(index, { ...goal.specific, dayOfWeek: event.target.value })}
                    >
                      <option value="first">First Day of Month</option>
                      <option value="last">Last Day of Month</option>                      
                    </select>
                  </div>
                  <div className="daily-checkins">
                    <span class="checkin-text">Time of Day:</span>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>                  
                      <DesktopTimePicker
                          value={goal.specific}
                          onChange={(value) => handleSpecificChange(index, value)}
                        />
                    </LocalizationProvider>
                  </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      When will you act on each of your habits?
      <table>
        <thead>
          <tr>
            <th>Habit</th>
            <th>Frequency</th>
            <th>Specific</th>
          </tr>
        </thead>
        <tbody>
          {goals.map((goal, index) => (
            <tr key={index}>
              <td>{goal.name}</td>
              <td>
                <select
                  value={goal.frequency}
                  onChange={(event) => handleFrequencyChange(index, event)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </td>
              <td>
                {goal.frequency === 'daily' && (
                  <div className="daily-checkins">
                    <span class="checkin-text">Time of Day:</span>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>                  
                      <DesktopTimePicker
                          value={goal.specific}
                          onChange={(value) => handleSpecificChange(index, value)}
                        />
                    </LocalizationProvider>
                  </div>
                )}
                {goal.frequency === 'weekly' && (
                  <div>
                  <div className="daily-checkins">      
                    <span class="checkin-text">Day of Week:</span>            
                    <select class="dayofweek"
                      value={goal.specific.dayOfWeek}
                      onChange={(event) => handleSpecificChange(index, { ...goal.specific, dayOfWeek: event.target.value })}
                    >
                      <option value="Sunday">Sunday</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>                    
                      <option value="Saturday">Saturday</option>
                    </select>
                  </div>
                  <div className="daily-checkins">
                    <span class="checkin-text">Time of Day:</span>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>                  
                      <DesktopTimePicker
                          value={goal.specific}
                          onChange={(value) => handleSpecificChange(index, value)}
                        />
                    </LocalizationProvider>
                  </div>
                  </div>
                )}
                {goal.frequency === 'monthly' && (
                  <div>
                  <div className="daily-checkins">      
                    <span class="checkin-text">Day of Month:</span>            
                    <select class="dayofweek"
                      value={goal.specific.dayOfWeek}
                      onChange={(event) => handleSpecificChange(index, { ...goal.specific, dayOfWeek: event.target.value })}
                    >
                      <option value="first">First Day of Month</option>
                      <option value="last">Last Day of Month</option>                      
                    </select>
                  </div>
                  <div className="daily-checkins">
                    <span class="checkin-text">Time of Day:</span>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>                  
                      <DesktopTimePicker
                          value={goal.specific}
                          onChange={(value) => handleSpecificChange(index, value)}
                        />
                    </LocalizationProvider>
                  </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GoalCheckin;
