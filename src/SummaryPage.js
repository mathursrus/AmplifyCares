import React from 'react';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { getApiUrl } from './utils/urlUtil';

const SummaryPage = () => {

  const user = localStorage.getItem('userDisplayName');
  const [chartData, setChartData] = useState([]);

  //const endDay = new Date(Date.parse("2023-02-27"));
  

  useEffect(() => {
    async function fetchData() {
      const selfCareData = await getAggregateStats(getApiUrl("/getselfcarestats/?item="+user));
      const medianCareData = await getAggregateStats(getApiUrl("/getpercentiles?item=50"));
      const highCareData = await getAggregateStats(getApiUrl("/getpercentiles?item=90"));

      const endDay = new Date(2023, 2, 12);
      const startDay = new Date(endDay);
      startDay.setDate(endDay.getDate()-7);

      setChartData(processChartData(selfCareData, medianCareData, highCareData, startDay, endDay));
    }
    fetchData();
  }, []);
  
  async function getAggregateStats(url) {
    const response = await fetch(url);
    const data = await response.json();
    return JSON.parse(data);
  };

  function processChartData(selfCareData, medianCareData, highCareData, startDay, endDay) {
    const myData = [];
    console.log("Processing for dates ", startDay, " to ", endDay);

    for (let date = startDay; date <= endDay; date.setDate(date.getDate() + 1)) {
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

    return myData;
  };

  const formatDate = (date) => {
    return date.slice(5,11);
  };

  return (
    <div>
      <center>
        <div style={{marginTop: '1rem'}}/>
        <h1 className="header">{user}'s Personal Self Care Data</h1>
        <h2 className="subheader">See your self care journey and how it's comparing to others.</h2>
        <br></br>
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
          <LineChart width={600} height={300} data={chartData}>
            <XAxis 
             stroke="black" 
              tickFormatter={formatDate} 
              dataKey="date"
            />
            <YAxis  
              stroke="black" 
            />
            <Line type="monotone" dataKey="self_care_minutes" stroke="black" name="You" />
            <Line type="monotone" dataKey="median_care_minutes" stroke="green" strokeDasharray="5 5" name="Most Others" />
            <Line type="monotone" dataKey="high_care_minutes" stroke="blue" strokeDasharray="3 3" name="The Best" />
            <Tooltip contentStyle={{ backgroundColor: "transparent" }} />
            <Legend />
          </LineChart>
        ) : (
          <p>Loading...</p>
        )}
      </center>
      <br />
    </div>
  );
};

export default SummaryPage;




