import React from "react";
import './App.css';
import { useState, useEffect } from 'react';
import { getApiHost } from './utils/urlUtil';

function TeamList() {
  
  const [teams, setTeams] = useState(null);

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
      <div style={{marginTop: '1rem'}}/>
      <center>
        <h3 className="subheader">If you'd like to create or be added to a team, send us feedback and we'll gladly do so.</h3>
      </center>
      <br></br>
      { teams ?
      (
        <div>
          {teams.map((team, index) => (
              <div key={index}>
                  <center><h3>{team.team_name}</h3></center>
                  {team.team_members.map((member, index2) => (                    
                      <center key={index2}>{member.member_id}</center>              
                  ))}
              </div>
          ))} 
        </div>     
       ) : (
            <center>Loading...</center>
       ) 
      }
    </div>
  );
};

export default TeamList;


