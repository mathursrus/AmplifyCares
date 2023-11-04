import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import './SummaryPage.css';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, Label } from 'recharts';
import { getApiUrl } from './utils/urlUtil';
import { DateRange } from "./DateRange/DateRange";
import WordCloud from 'react-d3-cloud';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import CoPilot from './CoPilot';

const SummaryPage = () => {

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [activitiesData, setActivitiesData] = useState([]);
  const [habitsData, setHabitsData] = useState([]);
  const [showSelf, setShowSelf] = useState(true);
  const [showMostOthers, setShowMostOthers] = useState(true);
  const [showTheBest, setShowTheBest] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("total");
  // Initialize the visibility state for each habit
  const [habitVisibility, setHabitVisibility] = useState('');
  //const [habitColors, setHabitColors] = useState({});
  const userName = localStorage.getItem('userName');
  const currentDate = new Date(); // Get the current date
  const currentMonth = currentDate.getMonth(); // Get the current month
  const currentYear = currentDate.getFullYear(); // Get the current year  

  // Set the endDay to the last day of the current month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const [endDay, setEndDay] = useState(lastDayOfMonth);

  // Set the startDay to the first day of the current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const [startDay, setStartDay] = useState(firstDayOfMonth);

  // copilot
  const [showCopilot, setShowCopilot] = useState(false);

  // prompts with insights
  const userPrompts = [
    "How is my self-care routine?",
    "Can you suggest self-care activities for reducing stress and improving mental well-being?",
    "Learning from others in my team, what activities can I easily incorporate into my self-care routine?",
    "How can I improve my social care activities?"
  ]

  const systemPrompts = [
    "How is my self-care routine? Am I consistent across week days, week ends? Are there particular days where I am doing or not doing an activity? What am I doing well and what am I not?",
    "What activities should I focus on for stress reduction and mental well-being? Am I already doing some, what am I not doing?",
    "In addition to what I am doing, what are some easy activities I can incorporate into my self-care routine? When should I do them?",
    "How is my social care? What can I do to improve social well being and gain joy from giving and interacting with others?"
  ]
      
  const processChartData = useCallback((selfCareData, medianCareData, highCareData, start, end) => {
    const myData = [];
    console.log("Processing for dates ", start, " to ", end);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = ""+year+"-"+month+"-"+day;

      // populate data points per day
      const selfCarePoint = selfCareData.find(point => point._id === dateString);
      const selfCareMinutes = selfCarePoint ? selfCarePoint.total_health_time : 0;
      const medianCarePoint = medianCareData.find(point => point._id === dateString);
      const medianCareMinutes = medianCarePoint ? medianCarePoint.ptile : 0;
      const highCarePoint = highCareData.find(point => point._id === dateString);
      const highCareMinutes = highCarePoint ? highCarePoint.ptile : 0;
      myData.push({
        date: dateString,
        self_care_minutes: selfCareMinutes,
        median_care_minutes: medianCareMinutes,
        high_care_minutes: highCareMinutes
      });      
    }

    return myData;
  }, []);

  const processActivitiesData = useCallback((selfCareData, medianCareData, highCareData) => {
    const myData = [];
    const selfCareActivities = processActivityData(selfCareData);
    const medianCareActivities = processActivityData(medianCareData);
    const highCareActivities = processActivityData(highCareData);
    // get the maximum and minimum of values in the arrays
    const {max, min} = findMaxMinValues([selfCareActivities, medianCareActivities, highCareActivities]);
    myData.push({
      self_care_activities: selfCareActivities,
      median_care_activities: medianCareActivities,
      high_care_activities: highCareActivities,
      max_time_on_activity: max,
      min_time_on_activity: min
    });
    console.log("Activity data is ", myData);
    return myData;
  }, []);

  const restructureHabitData = useCallback((inputData) => {
    // Create a Set to store all unique habit names
    const habitNamesSet = new Set();
  
    const habitColors = {};
          
    // Iterate through the inputData to build the habitNamesSet
    inputData.forEach((entry) => {
      const { habits_data } = entry;
      habits_data.forEach((habit) => {
        const { text } = habit;
        if (habitNamesSet.size === 0) setHabitVisibility(text); // make the first habit visible by default
        if (!habitNamesSet.has(text)) {
          habitNamesSet.add(text);
          habitColors[text] = getRandomColor();           
        }
      });
    });
  
    //setHabitColors(habitColors);
          
    // Create an array to store the restructured data
    const habitTimeArray = [];
  
    inputData.forEach((entry) => {
      const { date, habits_data } = entry;
  
      // Initialize a date entry with all habits set to 0
      const dateEntry = { date };
      for (const habitName of habitNamesSet) {
        dateEntry[habitName] = 0;
      }
  
      habits_data.forEach((habit) => {
        const { text, value } = habit;
  
        // Update the value for the corresponding habit in the date entry
        dateEntry[text] = value;
      });
  
      // Push the date entry to the array
      habitTimeArray.push(dateEntry);
    });
  
    console.log("Habit Time Array is ", habitTimeArray);
  
    return habitTimeArray;
  }, []);
  
  
  const processHabitsData = useCallback((selfCareData, start, end) => {
    const myData = [];
    console.log("Processing habits for dates ", start, " to ", end);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = ""+year+"-"+month+"-"+day;

      // populate data points per day
      const habitsPoint = selfCareData.find(point => point._id === dateString);
      console.log("Got habits Point ", habitsPoint);
      const habitsData = habitsPoint? processActivityData([habitsPoint]):[];      
      myData.push({
        date: dateString,
        habits_data: habitsData
      });      
    }
      
    return restructureHabitData(myData);
  }, [restructureHabitData]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // fix the end date
      const today = new Date();
      const utcEnd = (today > endDay)? 
                endDay:
                today;
      // get self-care data from cache
      const selfCareData = await getAggregateStats(getApiUrl(`/getselfcarestats/?item=${userName}&startDay=${startDay.toLocaleDateString()}&endDay=${utcEnd.toLocaleDateString()}&category=${selectedCategory}`));
      const medianCareData = await getAggregateStats(getApiUrl(`/getpercentiles?item=50&startDay=${startDay.toLocaleDateString()}&endDay=${utcEnd.toLocaleDateString()}&category=${selectedCategory}`));
      const highCareData = await getAggregateStats(getApiUrl(`/getpercentiles?item=99&startDay=${startDay.toLocaleDateString()}&endDay=${utcEnd.toLocaleDateString()}&category=${selectedCategory}`));

      //const habitData = await getAggregateStats(getApiUrl(`/getselfcareactivities/?item=${userName}&startDay=${startDay.toLocaleDateString()}&endDay=${utcEnd.toLocaleDateString()}`))
      //console.log("Habit data is ", habitData);

      setChartData(processChartData(selfCareData, medianCareData, highCareData, startDay, utcEnd));
      setActivitiesData(processActivitiesData(selfCareData, medianCareData, highCareData));
      setHabitsData(processHabitsData(selfCareData, startDay, utcEnd))
      setLoading(false);
    }
    console.log("Summary page got called with start day ", startDay, ", end day ", endDay);
    fetchData();
  }, [endDay, startDay, userName, selectedCategory, processChartData, processActivitiesData, processHabitsData]);
  
  async function getAggregateStats(url) {
    const response = await fetch(url);
    const data = await response.json();
    return JSON.parse(data);
  };  

  function processActivityData(data) {
    console.log("Processing Activity Data ", data);
    const activityMap = new Map();
  
    data.forEach((entry) => {
      const activities = entry.activities.filter((activity) => activity[0] !== null);
  
      activities.forEach((activity) => {
        const [activityNames, activityValue] = activity;
        if (activityNames !== undefined && activityNames.length > 0) {          
          activityNames.forEach((activityName) => {
            if (activityName !== null) {              
              if (activityMap.has(activityName)) {
                activityMap.set(activityName, activityMap.get(activityName) + activityValue);
              } else {
                activityMap.set(activityName, activityValue);
              }
            }
          });
        }
      });
    });      

    const result = [];
    if (activityMap.size > 0) {
      activityMap.forEach((value, key) => {
        result.push({text: key, value});
      });
    }    
  
    return result;
  }

  function launchCopilot() {
    setShowCopilot(true);
  }

  function findMaxMinValues(careData) {
    let max = 0;
    let min = 100000;

    careData.forEach((arr) => {
      if (arr.length > 0) {        
        arr.forEach((item) => {
          const value = item.value;
          max = Math.max(max, value);
          min = Math.min(min, value);
        });
      }
    });
    return { max, min };
  }

  const formatDate = (date) => {
    return date.slice(5, 10);
  };

  const habitNames = Array.from(
    new Set(habitsData.flatMap((entry) => Object.keys(entry).filter((key) => key !== 'date')))
  );

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <Container>            
    <div className="legend-container"> 
      <div className="summary-container">
        <DateRange
          startDay={startDay}
          endDay={endDay}
          setStartDay={setStartDay}
          setEndDay={setEndDay}
          message={`Your Self Care Stats for ${startDay.toLocaleString('en-US', { month: 'long' })} ${startDay.toLocaleString('en-US', { year: 'numeric' })}`}
          image={"Copilot.png"}
          imageTitle={"Your self-care copilot"}
          onImageClick={() => launchCopilot()}
          />        

        <center>
          {/* Add a dropdown select for category selection */}
          <select className="category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="total">Overall Self Care</option>
            <option value="mental">Mental Care</option>
            <option value="physical">Physical Care</option>
            <option value="spiritual">Spiritual Care</option>
            <option value="social">Social Care</option>            
          </select>          
        </center>
        <center>
          <div style={{marginTop: '1rem'}}/>
          <h2 className="subheader">See your self care journey (and enhance it by learning from others like you).</h2>
          <br></br>
          
          {!loading?  
          (<div>
           {chartData.length > 0 && activitiesData.length > 0 ?
           (
            <div class="summary-chart">
              <LineChart width={750} height={300} data={chartData}>
                <XAxis 
                stroke="black" 
                  tickFormatter={formatDate} 
                  dataKey="date"
                />
                <YAxis  
                  stroke="black">
                  <Label
                    value="Total Minutes Spent on Self-Care"
                    position="insideLeft"
                    angle={-90}
                    offset={10}
                    style={{ textAnchor: 'middle', fontWeight: 'bold', fill: 'black' }}
                  /> 
                </YAxis>
                {showSelf && (
                  <Line
                    type="monotone"
                    dataKey="self_care_minutes"
                    stroke="purple"
                    strokeWidth="4"
                    name="You"
                  />
                )}
                {showMostOthers && (
                  <Line
                    type="monotone"
                    dataKey="median_care_minutes"
                    stroke="orange"
                    strokeWidth="2"
                    name="The Majority"
                  />
                )}
                {showTheBest && (
                  <Line
                    type="monotone"
                    dataKey="high_care_minutes"
                    stroke="green"
                    strokeWidth="2"
                    name="The Best"
                  />
                )}
                <Tooltip contentStyle={{ backgroundColor: "transparent" }} />              
              </LineChart>                               
              <div class="wordcloud-container"> 
                <div className="label-container">
                  <span className="label">Self-care activities</span>
                </div>
                {showSelf && (
                  <div class="wordcloud">
                    <WordCloud 
                        data={activitiesData[0].self_care_activities}  
                        fontSize={(word) => 20+80*(word.value-activitiesData[0].min_time_on_activity+1)/(activitiesData[0].max_time_on_activity-activitiesData[0].min_time_on_activity+1)}
                        rotate={0}
                        spiral="rectangular"      
                        padding={5}
                        fill={"purple"}                                                 
                    />                  
                  </div>             
                )}
                {showMostOthers && (
                  <div class="wordcloud">
                    <WordCloud 
                      data={activitiesData[0].median_care_activities}  
                      fontSize={(word) => 20+80*(word.value-activitiesData[0].min_time_on_activity+1)/(activitiesData[0].max_time_on_activity-activitiesData[0].min_time_on_activity+1)}
                      rotate={0}
                      spiral="rectangular"      
                      padding={5}
                      fill={"orange"}                                                 
                    />
                  </div>
                )}  
                {showTheBest && (
                  <div class="wordcloud">
                    <WordCloud 
                      data={activitiesData[0].high_care_activities}  
                      fontSize={(word) => 20+80*(word.value-activitiesData[0].min_time_on_activity+1)/(activitiesData[0].max_time_on_activity-activitiesData[0].min_time_on_activity+1)}
                      rotate={0}
                      spiral="rectangular"      
                      padding={5}
                      fill={"green"}                                                 
                    />
                  </div>
                )}                    
              </div>
              <Legend
                content={(props) => {
                  return (
                    <div className="legend-items">
                      <div
                        className="legend-item"
                        onClick={() => setShowSelf(!showSelf)}
                      >
                        <span
                          style={{ color: 'purple', paddingRight: '5px', cursor: 'pointer' }}
                          title="Hours you spent on self care in the day"
                        >
                          {showSelf ? '● ' : '○ '}
                          You
                        </span>                      
                      </div>
                      <div
                        className="legend-item"
                        onClick={() => setShowMostOthers(!showMostOthers)}
                      >
                        <span
                          style={{ color: 'orange', paddingRight: '5px', cursor: 'pointer' }}
                          title="Median hours spent by everyone on self care in the day"
                        >
                          {showMostOthers ? '● ' : '○ '}
                          The Majority
                        </span>                      
                      </div>
                      <div
                        className="legend-item"
                        onClick={() => setShowTheBest(!showTheBest)}
                      >
                        <span
                          style={{ color: 'green', paddingRight: '5px', cursor: 'pointer' }}
                          title="Hours spent by the top 10% on self care in the day"
                        >
                          {showTheBest ? '● ' : '○ '}
                          The Best
                        </span>                      
                      </div>
                    </div>
                    );
                  }}
              />                
              {habitsData && (
                <div>
                <br></br> 
                <h2 className="subheader">Be consistent with your self care habits.</h2>  
                {(habitNames.length > 0) ? (
                  <div>
                  <div className="legend">
                      <select className="category" value={habitVisibility} onChange={(e) => setHabitVisibility(e.target.value)}>
                        {habitNames.map((habitName) => (
                          <option value={habitName} color='purple'>
                            {habitName}
                          </option>
                        ))}
                      </select>    
                  </div>                         
                  <LineChart width={750} height={300} data={habitsData}>
                    <XAxis stroke="black" tickFormatter={formatDate} dataKey="date"/>
                    <YAxis stroke="black">
                      <Label
                        value="Your habit consistency"
                        position="insideLeft"
                        angle={-90}
                        offset={10}
                        style={{ textAnchor: 'middle', fontWeight: 'bold', fill: 'black' }}
                      />
                    </YAxis>                  
                    {habitNames.map((habitName) => (
                      habitVisibility === habitName && (
                        <Line
                          key={habitName}
                          type="monotone"
                          dataKey={habitName}
                          stroke="purple"
                          strokeWidth={2}
                          name={habitName}
                        />
                      )
                    ))}
                    <Tooltip contentStyle={{ backgroundColor: "transparent" }} />                                    
                  </LineChart>
                  </div>                
                ) : (
                  <i>No habits being tracked. Track your habits by entering time <Link to={`/?submit-time-page`}>here</Link></i> 
                )}
                </div>                         
              )}
            </div>
            ) : (
            <p>No Data</p>
            )} 
            </div>             
          ) : (
            <p>Loading...</p>
          )}
        </center>
        <br />
      </div>             
    </div>
    {showCopilot && (
          <div className="flyout show">            
              <div className="flyout-header">
                  {console.log("Opening copilot")}
                  <FontAwesomeIcon className="flyout-close" icon={faTimes} onClick={() => setShowCopilot(false)} />
                  <CoPilot endpoint={"getselfcareinsights"} userprompts={userPrompts} systemprompts={systemPrompts} />
              </div>                      
          </div>
      )}
    </Container>
  );
};

export default SummaryPage;




