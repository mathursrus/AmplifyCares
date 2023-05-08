import { set } from 'mongoose';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SummaryPage = () => {

  const user = "Bob";
  const [chartData, setChartData] = useState([]);
  const [duration, setDuration] = useState(7); // duration of data in days
  //const endDay = new Date(Date.parse("2023-02-27"));
  

  useEffect(() => {
    async function fetchData() {
      const selfCareData = await getAggregateStats("http://localhost:8080/getselfcarestats/?item="+user);
      const medianCareData = await getAggregateStats("http://localhost:8080/getpercentiles?item=50");
      const highCareData = await getAggregateStats("http://localhost:8080/getpercentiles?item=90");

      /*
      const selfCareData = [
        { _id: "2023-02-15", total_health_time: 60 },
        { _id: "2023-02-17", total_health_time: 90 },
        { _id: "2023-02-20", total_health_time: 120 },
        { _id: "2023-02-22", total_health_time: 80 },
        { _id: "2023-02-25", total_health_time: 100 },
        { _id: "2023-02-28", total_health_time: 150 },
        { _id: "2023-03-03", total_health_time: 70 },
        { _id: "2023-03-07", total_health_time: 110 },
        { _id: "2023-03-10", total_health_time: 140 },
        { _id: "2023-03-12", total_health_time: 90 },
        { _id: "2023-03-15", total_health_time: 120 },
      ];
  
      const medianCareData = [
        { _id: "2023-02-15", total_health_time: 20 },
        { _id: "2023-02-16", total_health_time: 60 },
        { _id: "2023-02-17", total_health_time: 40 },
        { _id: "2023-02-18", total_health_time: 90 },
        { _id: "2023-02-20", total_health_time: 120 },
        { _id: "2023-02-22", total_health_time: 80 },
        { _id: "2023-02-23", total_health_time: 40 },
        { _id: "2023-02-24", total_health_time: 70 },
        { _id: "2023-02-25", total_health_time: 100 },
        { _id: "2023-02-28", total_health_time: 150 },
        { _id: "2023-03-03", total_health_time: 70 },
        { _id: "2023-03-04", total_health_time: 70 },
        { _id: "2023-03-05", total_health_time: 70 },
        { _id: "2023-03-06", total_health_time: 70 },
        { _id: "2023-03-07", total_health_time: 110 },
        { _id: "2023-03-10", total_health_time: 140 },
        { _id: "2023-03-12", total_health_time: 90 },
        { _id: "2023-03-15", total_health_time: 120 },
      ];
      
  
      const highCareData = [
        { _id: "2023-02-15", total_health_time: 80 },
        { _id: "2023-02-16", total_health_time: 120 },
        { _id: "2023-02-17", total_health_time: 90 },
        { _id: "2023-02-18", total_health_time: 100 },
        { _id: "2023-02-20", total_health_time: 130 },
        { _id: "2023-02-22", total_health_time: 180 },
        { _id: "2023-02-23", total_health_time: 140 },
        { _id: "2023-02-24", total_health_time: 100 },
        { _id: "2023-02-25", total_health_time: 140 },
        { _id: "2023-02-28", total_health_time: 160 },
        { _id: "2023-03-03", total_health_time: 90 },
        { _id: "2023-03-04", total_health_time: 90 },
        { _id: "2023-03-05", total_health_time: 100 },
        { _id: "2023-03-06", total_health_time: 80 },
        { _id: "2023-03-07", total_health_time: 140 },
        { _id: "2023-03-10", total_health_time: 160 },
        { _id: "2023-03-12", total_health_time: 190 },
        { _id: "2023-03-15", total_health_time: 140 },
      ];
      */

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



    /*
    selfCareData.forEach((datum) => {
      let date=new Date(datum._id);
      let index=myData.indexOf(date);
      if (index !== -1) {
        myData[index].self_care_time=datum.total_health_time;
      }
      else {
        myData.push({
          _id: new Date(datum._id),
          self_care_time: datum.total_health_time
        });
      }
    });

    medianCareData.forEach((datum) => {
      let date=new Date(datum._id);
      let index=myData.indexOf(date);
      if (index !== -1) {
        myData[index].median_care_time=datum.ptile;
        console.log("Added median of ", datum.ptile, "to date ", date);
      }
      else {
        myData.push({
          _id: new Date(datum._id),
          median_care_time: datum.ptile
        });
      }
    });

    highCareData.forEach((datum) => {
      let date=new Date(datum._id);
      let index=myData.indexOf(date);
      if (index !== -1) {
        myData[index].high_care_time=datum.ptile;
        console.log("Added high of ", datum.ptile, "to date ", date);
      }
      else {
        myData.push({
          _id: new Date(datum._id),
          high_care_time: datum.ptile
        });
      }
    });
    */

    return myData;
  };

  const formatDate = (date) => {
    return date.slice(5,11);
  };

  return (
    <div>
      <center>
        <h1>{user}, here are your Self-Care Stats</h1>
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
              //domain={[startDay.toISOString(), endDay.toISOString()]} 
              //scale="time" 
              stroke="black" 
              tickFormatter={formatDate} 
              dataKey="date"
            />
            <YAxis  
              //domain={[0, Math.max(...chartData.map((dataPoint) => dataPoint.high_care_minutes))+10]} 
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




