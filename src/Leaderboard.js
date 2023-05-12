import React from "react";
import "./Leaderboard.css";
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal } from "@fortawesome/free-solid-svg-icons";
import { getApiHost } from './utils/urlUtil';
import { ago } from './DateRange/computeDays';
import { DateRange } from "./DateRange/DateRange";

function Leaderboard() {
  
  const [leaders, setLeaders] = useState([]);
  //const [duration, setDuration] = useState(7); // duration of data in days
  //const endDay = new Date(Date.parse("2023-02-27"));
  const [endDay, setEndDay] = useState(Date.now());
  const [startDay, setStartDay] = useState(ago(endDay, 7))

  useEffect(() => {
    async function fetchData() {
        const response = await fetch( getApiHost() + `/getteamstats/startDay/${ago(endDay, 7)}/endDay/${endDay}`);
        const data = await response.json();
        const myleaders = JSON.parse(data);
        setLeaders(myleaders);
        console.log("Leaders are ", myleaders);
    }
    fetchData();
  }, [endDay]);

  return (
    <div className="leaderboard-container">
      <DateRange
        startDay={startDay}
        endDay={endDay}
        setStartDay={setStartDay}
        setEndDay={setEndDay}
      />
      <center><h1>Leaderboard</h1></center>
      { leaders.length > 0 ?
      (
        <div>
            <div className="medal-podium">        
                <div className="medal-container">
                    <FontAwesomeIcon className="medal-icon-silver-medal" icon={faMedal} />
                    <br></br>
                    <center><b>{leaders[1]._id}</b></center>
                    <br></br>
                    <center>{leaders[1].median}</center>
                    <div className="bar-chart-container">
                        <div className="bar-chart-silver" style={{ height: `${(leaders[1].total_health_time / leaders[0].total_health_time) * 100}%` }}></div>
                    </div>
                </div>

                <div className="medal-container">
                    <FontAwesomeIcon className="medal-icon-gold-medal" icon={faMedal} />
                    <br></br>
                    <center><b>{leaders[0]._id}</b></center>
                    <br></br>
                    <center>{leaders[0].median}</center>
                    <div className="bar-chart-container">
                        <div className="bar-chart-gold" style={{ height: `${(leaders[0].total_health_time / leaders[0].total_health_time) * 100}%` }}></div>            
                    </div>
                </div>

                <div className="medal-container">
                    <FontAwesomeIcon className="medal-icon-bronze-medal" icon={faMedal} />
                    <br></br>
                    <center><b>{leaders[2]._id}</b></center>
                    <br></br>
                    <center>{leaders[2].median}</center>
                    <div className="bar-chart-container">
                        <div className="bar-chart-bronze" style={{ height: `${(leaders[2].total_health_time / leaders[0].total_health_time) * 100}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="other-participants-container">
                <center><h2>In Calm Pursuit ...</h2></center>
                {leaders.slice(3).map((player, index) => (
                    <div key={index} className="player">
                        <span className="name"><b>{player._id}</b>       </span>
                        <span className="score"><b>{player.median}</b></span>
                        <br></br>
                    </div>
                ))}
            </div>
        </div>
       ) : (
            <p>Loading...</p>
       ) }
    </div>
  );
};

export default Leaderboard;


