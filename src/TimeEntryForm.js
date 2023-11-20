import Button from 'react-bootstrap/Button';
import DatePicker from 'react-datepicker';
import { evaluate } from 'mathjs';
import 'react-datepicker/dist/react-datepicker.css';
import './TimeEntryForm.css';

const React = require('react');
const { useState } = React;

const TimeEntryForm = ({activity, activityType, onSubmit}) => {
    
    const [activityTime, setActivityTime] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());         
    
    console.log("TimeEntryForm called with activity ", activity, "activityType ", activityType);

    const getSubmissionTime = () => {            
        const date = selectedDate.toLocaleDateString();
        console.log(date);
        return date;
    }
    
    const handleSubmit = async(e) => {             
        // Submit form data
        const itemData = {
            name: localStorage.getItem('userName'),
            DateTime: getSubmissionTime(),
            lastEdited: new Date(),
        };
        if (activityType === 1) {
            itemData.mental_health_time = parseInt(activityTime);
            itemData.mental_health_activity = [activity];
        }
        if (activityType === 2) {
            itemData.physical_health_time = parseInt(activityTime);
            itemData.physical_health_activity = [activity];
        }
        if (activityType === 3) {
            itemData.spiritual_health_time = parseInt(activityTime);
            itemData.spiritual_health_activity = [activity];
        }
        if (activityType === 4) {
            itemData.societal_health_time = parseInt(activityTime);
            itemData.societal_health_activity = [activity];
        }        
        console.log(itemData)
        onSubmit(itemData);
    };

    
    return (        
        <div>                            
            <form className='enter-time-form'>                
                <center>
                    <h5>Enter the date and time you spent on {activity}</h5>
                    <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {console.log("Selected date ", date); setSelectedDate(date)}}
                    dateFormat="MM/dd/yyyy"
                    className="date-picker"
                    />
                </center>                                                         
                
                <div className='row'>                    
                    <div className="enter-time-input-container">
                        <input
                            type="text"
                            className="enter-time-text-field time-input"
                            value={activityTime}
                            onChange={(e) => {
                                const input = e.target.value;
                                try {
                                    const result = evaluate(input);
                                    const time = result.toString();
                                    console.log("Time is ", time);
                                    setActivityTime(time);
                                } catch (error) {
                                    const time = '';
                                    setActivityTime(time);
                                }
                            }}
                            placeholder={`Minutes dedicated`}
                        />                                               
                    </div>
                </div>                    
                <br></br>
                <div className='row'>
                    <Button onClick={handleSubmit}><b>Submit</b></Button>                                        
                </div>
            </form>
        </div>
    );
};

export default TimeEntryForm;