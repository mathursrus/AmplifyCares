import 'bootstrap/dist/css/bootstrap.min.css';
import { Outlet, Link, useLocation } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Navbar from "react-bootstrap/Navbar";
//import * as microsoftTeams from '@microsoft/teams-js';
import './Layout.css';
import FirstRunExperience from './FirstRunExperience';
import SelfCareCoach from './SelfCareCoach';
import Flyout from './Flyout';

function Layout() {
  const location = useLocation();
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [flyoutState, setFlyoutState] = useState(false);
  const [flyoutComponent, setFlyoutComponent] = useState(null);
  /*
  try {
    microsoftTeams.initialize();
    microsoftTeams.getContext(async (context) => {
      try {
        const userPrincipalName = context.userPrincipalName;
        localStorage.setItem('userName', userPrincipalName);
        const accessToken = await microsoftTeams.authentication.getAuthToken({
          successCallback: (token) => {
            fetch(`https://graph.microsoft.com/v1.0/users/${userPrincipalName}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
              .then(response => response.json())
              .then(data => {
                const userDisplayName = data.displayName;
                localStorage.setItem('userDisplayName', userDisplayName);
                console.log("Set context in Teams:", userPrincipalName, ", ", userDisplayName);
              });
          },
          failureCallback: (error) => {
            console.error('Failed to retrieve access token:', error);
          }
        });
      } catch (error) {
        console.error('Error retrieving access token:', error);
      }
    });
  } catch (e) {
    console.log("Code is not running in Microsoft Teams environment.");
  }*/

  /*if (localStorage.getItem('userName') === null) {
    localStorage.setItem('userName', 'Alice');
  }*/

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const showHabits = searchParams.get('showHabits');
    const habit = searchParams.get('habit');    
    const copilot = searchParams.get('show-copilot');
    setFlyoutState((showHabits || habit || copilot)?true:false);
    setFlyoutComponent(copilot==="1" ? "copilot" : null);       
  }, [location.search]);

  const handleAboutAmplifyCares = () => {
    setShowAboutDialog(true);
  };
  
  return (
    <>
      <Navbar className="nav" expand="lg">
        <Container>
          <div style={{ marginRight: '50px' }}>
            <Navbar.Brand as={Link} to="/submit-time-page">
              <img
                src={'/WhoCares.png'}
                alt="Amplify Cares"
                height="150"
              />            
            </Navbar.Brand>
          </div>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link
                as={Link}
                to="/goals"
                className={location.pathname === '/goals' ? 'active' : ''}
              >
                Your Goals
              </Nav.Link>              
              <Nav.Link
                as={Link}
                to="/submit-time-page"
                className={location.pathname === '/' || location.pathname === '/submit-time-page' ? 'active' : ''}
              >
                Submit Time
              </Nav.Link>              
              <Nav.Link
                as={Link}
                to="/summary-page"
                className={location.pathname === '/summary-page' ? 'active' : ''}
              >
                Self Care Stats
              </Nav.Link>
              <Nav.Link 
                as={Link}
                to={`?show-copilot=1&rand=${Math.random(1000)}`}
                className={location.pathname === '/self-care-coach' ? 'active' : ''}>        
                Your Self Care Coach
              </Nav.Link>              
              <Nav.Link
                as={Link}
                to="/leaderboard"
                className={location.pathname === '/leaderboard' ? 'active' : ''}
              >
                Leaderboard
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/team-list"
                className={location.pathname === '/team-list' ? 'active' : ''}
              >
                Team List
              </Nav.Link>                                          
            </Nav>
            <Nav className="justify-content-end">
              <Nav.Link onClick={handleAboutAmplifyCares}>
                About AmplifyCares
              </Nav.Link>
            </Nav>            
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {showAboutDialog && <FirstRunExperience screen={1} onClose={() => setShowAboutDialog(false)} />}
      {flyoutState && <Flyout Component={flyoutComponent==="copilot"?SelfCareCoach:null} onClose={() => {setFlyoutComponent(null); setFlyoutState(false)}} />}
      <center>
        <h2 className="header">Welcome {localStorage.getItem('userDisplayName')} to AmplifyCares</h2>
        <h2 className="subheader">A platform designed to encourage and measure self care... AmplifyCares, do you? </h2>
      </center>
      <Outlet />      
    </>
  )
};

export default Layout;
