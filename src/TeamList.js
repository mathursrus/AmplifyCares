import React from "react";
import './App.css';
import { useState, useEffect } from 'react';
import { getApiHost } from './utils/urlUtil';
import ChallengeForm from "./ChallengeForm";
import './TeamList.css';

function TeamList() {
  
  const [teams, setTeams] = useState(null);
  const [user, setUser] = useState(null);
  const [addingMemberToTeam, setAddingMemberToTeam] = useState(null);
  const [addingNewTeam, setAddingNewTeam] = useState(null);

  useEffect(() => {
    async function fetchData() {
        const response = await fetch(getApiHost() + "/getteamlist/");
        const data = await response.json();
        const teams = JSON.parse(data);
        setTeams(teams);
        console.log("Team List is ", teams);
    }
    fetchData();
    setUser(localStorage.getItem('userName'));
  }, []);

  const handleAddToTeamClicked = (teamId) => {
    console.log("User ", user, " called Add member ", teamId);
    setAddingMemberToTeam(teamId);
  };

  const inviteMembersToTeam = (members) => {
    console.log("User ", user, " invited members ", members, " to team ", addingMemberToTeam);
    // save the invitation
    const invite = "User " + user + " invited " + members + " to join team " + addingMemberToTeam;
    fetch(getApiHost() + "/sendInvite?invite=" + JSON.stringify(invite));
    setAddingMemberToTeam(null);      
  };

  const cancelAddToTeam = () => {
    setAddingMemberToTeam(null);
  };

  const handleAddNewTeamClicked = () => {
    console.log("User ", user, " called Add new team ");
    setAddingNewTeam(true);
  };

  const inviteMembersToCreateNewTeam = (members) => {
    console.log("User ", user, " invited members ", members, " to create new team ");
    // save the invitation
    const invite = "User " + user + " invited " + members + " to create a new team";
    fetch(getApiHost() + "/sendInvite?invite=" + JSON.stringify(invite));
    setAddingNewTeam(false);
  };

  const cancelAddNewTeam = () => {
    setAddingNewTeam(false);
  };

  
  return (
    <div>
      <div style={{marginTop: '5rem'}}/>
      <div style={{marginTop: '1rem'}}/>
      <center>
        <h3 className="subheader">Invite your colleagues to take care of themselves</h3>
      </center>
      <br></br>
      { teams ?
      (
        <div>
        <div className="team-list">
          {teams.map((team, index) => (
              <div key={index} className="team-card">
                  <center><h3>
                    {team.team_name}                    
                  </h3></center>
                  {team.team_members.map((member, index2) => (                    
                      <center key={index2}>{member.member_id}</center>              
                  ))}
                  {team.team_members.some(member => new RegExp(user).test(member.member_id)) && (
                      ((addingMemberToTeam === team._id) && (
                        <div className="invite-modal">
                          <div className="invite-modal-content">                            
                            <ChallengeForm
                              formTitle="Invite others to join your team"
                              textBoxPlaceholder="Email address of colleague to invite ..."
                              exclude = {team.team_members.map((member) => member.member_id)}
                              onSubmit={inviteMembersToTeam}
                              onCancel={cancelAddToTeam}                              
                            />
                          </div>
                        </div>                      
                      )) ||
                      ((addingMemberToTeam !== team._id) && (
                        <center><button className="invite" onClick={() => handleAddToTeamClicked(team._id)}>Invite a team member</button></center>
                      ))
                  )}                  
              </div>
          ))}          
        </div>
        <center>
          {((addingNewTeam) && (
              <div className="invite-modal">
                <div className="invite-modal-content">                            
                  <ChallengeForm
                    formTitle="Invite others to create a new team"
                    textBoxPlaceholder="Email address of colleague to invite ..."
                    exclude = {[user]}
                    onSubmit={inviteMembersToCreateNewTeam}
                    onCancel={cancelAddNewTeam}                              
                  />
                </div>
              </div>                      
            )) ||
            ((!addingMemberToTeam) && (
              <center><button className="invite" onClick={() => handleAddNewTeamClicked()}>Invite others to form a new team</button></center>
            )
          )}
        </center>      
        </div>
       ) : (
            <center>Loading...</center>
       ) 
      }
    </div>
  );
};

export default TeamList;


