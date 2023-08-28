import React from "react";
import "./Leaderboard.css";
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal } from "@fortawesome/free-solid-svg-icons";
import { getApiHost } from './utils/urlUtil';
import { DateRange } from "./DateRange/DateRange";
import ChallengeForm from "./ChallengeForm";

function Leaderboard() {
  
    const [user, setUser] = useState(null);
    const [leaders, setLeaders] = useState(null);
    const [newChallenge, setNewChallenge] = useState(false);

    const currentDate = new Date(); // Get the current date
    const currentMonth = currentDate.getMonth(); // Get the current month
    const currentYear = currentDate.getFullYear(); // Get the current year

    // Set the endDay to the last day of the current month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const [endDay, setEndDay] = useState(lastDayOfMonth);

    // Set the startDay to the first day of the current month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const [startDay, setStartDay] = useState(firstDayOfMonth);
    const [barHeight, setBarHeight] = useState(0);

  useEffect(() => {
    async function fetchData() {
        setBarHeight(0);
        console.log("Start day is ", startDay, ", End day is ", endDay);
        const utcStart = new Date(Date.UTC(startDay.getFullYear(), startDay.getMonth(), startDay.getDate()));
        // limit the data fetch to the lesser of today or end day
        const today = new Date();        
        const utcEnd = (today > endDay)? 
                new Date(Date.UTC(endDay.getFullYear(), endDay.getMonth(), endDay.getDate())):
                new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        const response = await fetch( getApiHost() + `/getteamstats/?startDay=${utcStart.toISOString()}&endDay=${utcEnd.toISOString()}`);
        const data = await response.json();
        const myleaders = JSON.parse(data);
        setLeaders(myleaders);
        console.log("Leaders are ", myleaders);
        // Trigger the animation when the component mounts
        setTimeout(() => {
            setBarHeight(200);
        }, 50);
    }
    setLeaders(null);
    fetchData();    
    setUser(localStorage.getItem('userName'));
    //new Audio('/drumroll.mp3').play();
  }, [endDay, startDay]);

  const createNewChallenge = (e) => {
    console.log("User ", user, " has challenged colleagues ", e);
    // save the invitation
    const invite = "User " + user + " invited " + e + " to a challenge";
    fetch(getApiHost() + "/sendInvite?invite=" + JSON.stringify(invite));
    setNewChallenge(false);
  }

  const cancelNewChallenge = (e) => {
    setNewChallenge(false);
  }

  return (
    <div>
    <div className="leaderboard-container">
      <DateRange
        startDay={startDay}
        endDay={endDay}
        setStartDay={setStartDay}
        setEndDay={setEndDay}
        message= {`Leaderboard for ${startDay.toLocaleString('en-US', { month: 'long' })} ${startDay.toLocaleString('en-US', { year: 'numeric' })}`}
        />
        <center>You succeed as a team when you bring others along. This is the daily time spent on self care by the <u>median team member</u>. </center>
        <br/>
            
        {leaders ? (
        <div>
            <div className="medal-podium"> 
            {leaders.length >= 2 && ( // Check if there are at least 2 leaders
            <div className={`medal-container animate-silver`}>
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
                    height: `${(leaders[1].median / leaders[0].median) * barHeight}px`,                    
                }}
                >
                    <div className="bar-chart-silver"></div>
                </div>
            </div>
            )}

            {leaders.length >= 1 && ( // Check if there are at least 2 leaders
            <div className={`medal-container animate-gold`}>
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
                    height: `${(leaders[0].median / leaders[0].median) * barHeight}px`,
                    }}
                >
                    <div className="bar-chart-gold"></div>
                </div>
            </div>
            )}

            {leaders.length >= 3 && ( // Check if there are at least 3 leaders
            <div className={`medal-container animate-bronze`}>
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
                    height: `${(leaders[2].median / leaders[0].median) * barHeight}px`,
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
                    <div key={index} className="other-participant">
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
        <center>Loading ...</center>
        )}
    </div>
    <div className="challenge-creation-container">
        {!newChallenge && (                    
                <button onClick={() => setNewChallenge(true)}>Challenge other colleagues to a friendly self-care competition</button>
        )}

        {/* Form for team selection */}
        {newChallenge && (
            <ChallengeForm
                formTitle="Challenge other colleagues to improve their self-care ..."
                textBoxPlaceholder="Email address of colleague to challenge ... "
                exclude = {[user]}
                onSubmit={createNewChallenge}
                onCancel={cancelNewChallenge}                              
            />            
        )}
    </div>

    {/*challengedUsers.length > 0 && (
        <div className="challenge-results-container">
            <div className="chart-container">
            </div>
        </div>
    )*/}      
    </div>
  );
};

export default Leaderboard;


