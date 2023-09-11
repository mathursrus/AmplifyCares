import React from 'react';
import './SummaryPage.css';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, Label } from 'recharts';
import { getApiUrl } from './utils/urlUtil';
import { DateRange } from "./DateRange/DateRange";
import WordCloud from 'react-d3-cloud';

const SummaryPage = () => {

  const [chartData, setChartData] = useState([]);
  const [activitiesData, setActivitiesData] = useState([]);
  const [showSelf, setShowSelf] = useState(true);
  const [showMostOthers, setShowMostOthers] = useState(false);
  const [showTheBest, setShowTheBest] = useState(false);
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

  useEffect(() => {
    async function fetchData() {
      // fix the end date
      const today = new Date();
      const utcEnd = (today > endDay)? 
                endDay:
                today;
      // get self-care data from cache
      const selfCareData = await getAggregateStats(getApiUrl(`/getselfcarestats/?item=${userName}&startDay=${startDay.toISOString()}&endDay=${utcEnd.toISOString()}`));
      const medianCareData = await getAggregateStats(getApiUrl(`/getpercentiles?item=50&startDay=${startDay.toISOString()}&endDay=${utcEnd.toISOString()}`));
      const highCareData = await getAggregateStats(getApiUrl(`/getpercentiles?item=99&startDay=${startDay.toISOString()}&endDay=${utcEnd.toISOString()}`));

      setChartData(processChartData(selfCareData, medianCareData, highCareData, startDay, utcEnd));
      setActivitiesData(processActivitiesData(selfCareData, medianCareData, highCareData));
    }
    console.log("Summary page got called with start day ", startDay, ", end day ", endDay);
    fetchData();
  }, [endDay, startDay, userName]);
  
  async function getAggregateStats(url) {
    const response = await fetch(url);
    const data = await response.json();
    return JSON.parse(data);
  };

  function processChartData(selfCareData, medianCareData, highCareData, start, end) {
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
  };

  function processActivitiesData(selfCareData, medianCareData, highCareData) {
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
  }

  function processActivityData(data) {
    const activityMap = new Map();
  
    data.forEach((entry) => {
      const activities = entry.activities.filter((activity) => activity[0] !== null);
  
      activities.forEach((activity) => {
        const [activityNames, activityValue] = activity;
        if (activityNames.length > 0) {
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
    else {
      result.push({text: '0 activities', value: 100});
    }
  
    return result;
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
    return date.slice(6, 10);
  };

  return (
    <div className="legend-container"> 
      <div className="summary-container">
        <DateRange
          startDay={startDay}
          endDay={endDay}
          setStartDay={setStartDay}
          setEndDay={setEndDay}
          message={`Your Self Care Data for ${startDay.toLocaleString('en-US', { month: 'long' })} ${startDay.toLocaleString('en-US', { year: 'numeric' })}`}
          />
        <center>
          <div style={{marginTop: '1rem'}}/>
          <h2 className="subheader">See your self care journey (and enhance it by learning from others like you).</h2>
          <br></br>
          
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
            </div>              
          ) : (
            <p>Loading...</p>
          )}
        </center>
        <br />
      </div>      
    </div>
  );
};

export default SummaryPage;




