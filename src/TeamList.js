import React from "react";
import './App.css';
import { useState, useEffect } from 'react';
import { getApiHost } from './utils/urlUtil';

function TeamList() {
  
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function fetchData() {
        const response = await fetch(getApiHost() + "/getteamlist/");
        const data = await response.json();
        const teams = JSON.parse(data);
        setTeams(teams);
        console.log("Team List is ", teams);
    }
    fetchData();
  }, []);

  return (
    <div>
      <div style={{marginTop: '5rem'}}/>
      { teams.length > 0 ?
      (
        <div>
        {teams.map((team, index) => (
            <div>
                <center><h3>{team.team_name}</h3></center>
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


