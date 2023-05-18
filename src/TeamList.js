import React from "react";
import './App.css';
import { useState, useEffect, useRef } from 'react';
import getServerString from './Utils';

function TeamList() {
  
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function fetchData() {
        const response = await fetch(getServerString()+"getteamlist/");
        const data = await response.json();
        const teams = JSON.parse(data);
        setTeams(teams);
        console.log("Team List is ", teams);
    }
    fetchData();
  }, []);

  return (
    <div>
      <center><h1>Team List</h1></center>
      { teams.length > 0 ?
      (
        <div>
        {teams.map((team, index) => (
            <div>
                <center><h2>{team.team_name}</h2></center>
                {team.team_members.map((member, index2) => (                    
                    <center>{member.member_id}</center>              
                ))}
            </div>
        ))} 
        </div>       
       ) : (
            <p>Loading...</p>
       ) 
      }
    </div>
  );
};

export default TeamList;


