import React from 'react';
import './SummaryPage.css';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, Label } from 'recharts';
import { getApiUrl } from './utils/urlUtil';
import { DateRange } from "./DateRange/DateRange";

const SummaryPage = () => {

  const [chartData, setChartData] = useState([]);
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
      // get self-care data from cache
      const selfCareData = await getAggregateStats(getApiUrl("/getselfcarestats/?item="+userName));
      const medianCareData = await getAggregateStats(getApiUrl("/getpercentiles?item=50"));
      const highCareData = await getAggregateStats(getApiUrl("/getpercentiles?item=90"));

      setChartData(processChartData(selfCareData, medianCareData, highCareData, startDay, endDay));
    }
    console.log("Got called with start day ", startDay, ", end day ", endDay);
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
      const dateString = date.toISOString().slice(0, 10);
      console.log("Processing for date ", dateString);
      const selfCarePoint = selfCareData.find(point => point._id === dateString);
      const selfCareMinutes = selfCarePoint ? selfCarePoint.total_health_time : 0;
      const medianCarePoint = medianCareData.find(point => point._id === dateString);
      const medianCareMinutes = medianCarePoint ? medianCarePoint.ptile : 0;
      const highCarePoint = highCareData.find(point => point._id === dateString);
      const highCareMinutes = highCarePoint ? highCarePoint.ptile : 0;
      console.log("time ", selfCareMinutes, ", ", medianCareMinutes, ",", highCareMinutes);
      myData.push({
        date: dateString,
        self_care_minutes: selfCareMinutes,
        median_care_minutes: medianCareMinutes,
        high_care_minutes: highCareMinutes
      });
    }

    console.log("Done processing for dates ", start, " to ", end);
    return myData;
  };

  const formatDate = (date) => {
    return date.slice(5,11);
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
          
          {/*
            chartData.length > 0 ? (
            <div>
              {chartData.map((data) => (
                <div key={data.date}>
                  <p>{data.date}</p>
                  <p>{data.self_care_minutes}</p>
                  <p>{data.median_care_minutes}</p>
                  <p>{data.high_care_minutes}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>Loading...</p>
          )*/}
          {chartData.length > 0 ? 
          (
            <div>
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
              <Line
                type="monotone"
                dataKey="self_care_minutes"
                stroke="purple"
                strokeWidth="4"
                name="You"
              />
              {showMostOthers && (
                <Line
                  type="monotone"
                  dataKey="median_care_minutes"
                  stroke="orange"
                  strokeWidth="2"
                  name="Most Others"
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
            <Legend
              content={(props) => {
                return (
                  <div className="legend-items">
                    <div
                      className="legend-item"                        
                    >
                      <span
                        style={{ color: 'purple', paddingRight: '5px', cursor: 'pointer' }}
                        title="Hours you spent on self care in the day"
                      >
                        ● You
                      </span>                      
                    </div>
                    <div
                      className="legend-item"
                      onClick={() => setShowMostOthers(!showMostOthers)}
                    >
                      <span
                        style={{ color: 'orange', paddingRight: '5px', cursor: 'pointer' }}
                        title="Median hours spent by your peers on self care in the day"
                      >
                        {showMostOthers ? '● ' : '○ '}
                        Most Others
                      </span>                      
                    </div>
                    <div
                      className="legend-item"
                      onClick={() => setShowTheBest(!showTheBest)}
                    >
                      <span
                        style={{ color: 'green', paddingRight: '5px', cursor: 'pointer' }}
                        title="Hours spent by the top 10% of your peers on self care in the day"
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




