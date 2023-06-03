import React from "react";
import "./Leaderboard.css";
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal } from "@fortawesome/free-solid-svg-icons";
import { getApiHost } from './utils/urlUtil';
import { DateRange } from "./DateRange/DateRange";

function Leaderboard() {
  
    const [leaders, setLeaders] = useState([]);
    //const [endDay, setEndDay] = useState(Date.now());
    //const [startDay, setStartDay] = useState(ago(endDay, 7));

    const currentDate = new Date(); // Get the current date
    const currentMonth = currentDate.getMonth(); // Get the current month
    const currentYear = currentDate.getFullYear(); // Get the current year

    // Set the endDay to the last day of the current month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    //const end = lastDayOfMonth.getTime();
    const [endDay, setEndDay] = useState(lastDayOfMonth);

    // Set the startDay to the first day of the current month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    //const start = firstDayOfMonth.getTime();
    const [startDay, setStartDay] = useState(firstDayOfMonth);


  useEffect(() => {
    async function fetchData() {
        const response = await fetch( getApiHost() + `/getteamstats/?startDay=${startDay.getTime()}&endDay=${endDay.getTime()}`);
        const data = await response.json();
        const myleaders = JSON.parse(data);
        setLeaders(myleaders);
        console.log("Leaders are ", myleaders);
    }
    fetchData();
  }, [endDay, startDay]);

  return (
    <div className="leaderboard-container">
      <DateRange
        startDay={startDay}
        endDay={endDay}
        setStartDay={setStartDay}
        setEndDay={setEndDay}
        message= {`Leaderboard for ${startDay.toLocaleString('en-US', { month: 'long' })} ${startDay.toLocaleString('en-US', { year: 'numeric' })}`}
        />

        <br/>
            
        {leaders.length > 0 ? (
        <div>
            <div className="medal-podium"> 
            {leaders.length >= 2 && ( // Check if there are at least 2 leaders
            <div className="medal-container">
                <FontAwesomeIcon className="medal-icon-silver-medal" icon={faMedal} />
                <br />
                <center>
                <b>{leaders[1]._id}</b>
                </center>
                <br />
                <center>{leaders[1].median}</center>
                <div
                className="bar-chart-container"
                style={{
                    height: `${(leaders[1].total_health_time / leaders[0].total_health_time) * 100}%`,
                }}
                >
                <div className="bar-chart-silver"></div>
                </div>
            </div>
            )}

            <div className="medal-container">
            <FontAwesomeIcon className="medal-icon-gold-medal" icon={faMedal} />
            <br />
            <center>
                <b>{leaders[0]._id}</b>
            </center>
            <br />
            <center>{leaders[0].median}</center>
            <div
                className="bar-chart-container"
                style={{
                height: `${(leaders[0].total_health_time / leaders[0].total_health_time) * 100}%`,
                }}
            >
                <div className="bar-chart-gold"></div>
            </div>
            </div>

            {leaders.length >= 3 && ( // Check if there are at least 3 leaders
            <div className="medal-container">
                <FontAwesomeIcon className="medal-icon-bronze-medal" icon={faMedal} />
                <br />
                <center>
                <b>{leaders[2]._id}</b>
                </center>
                <br />
                <center>{leaders[2].median}</center>
                <div
                className="bar-chart-container"
                style={{
                    height: `${(leaders[2].total_health_time / leaders[0].total_health_time) * 100}%`,
                }}
                >
                <div className="bar-chart-bronze"></div>
                </div>
            </div>
            )}
            </div>
            

            {leaders.length >= 4 && ( // Check if there are at least 3 leaders
                <div className="other-participants-container">
                <center>
                    <h2 className="title-box">In Calm Pursuit, the runner ups ...</h2>
                </center>
                {leaders.slice(3).map((player, index) => (
                    <div key={index} className="player">
                    <span className="name">
                        <b>{player._id}  </b>
                    </span>
                    <span className="score">
                        <b>{player.median}</b>
                    </span>
                    <br />
                    </div>
                ))}
                </div>
            )}            
        </div>
        ) : (
        <p>No Results</p>
        )}
    </div>
  );
};

export default Leaderboard;


