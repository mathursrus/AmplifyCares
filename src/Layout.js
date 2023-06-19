import 'bootstrap/dist/css/bootstrap.min.css';
import { Outlet, Link, useLocation } from "react-router-dom";
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Navbar from "react-bootstrap/Navbar";
import * as microsoftTeams from '@microsoft/teams-js';
import './App.css';

function Layout() {
  const location = useLocation();

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

  if (localStorage.getItem('userName') === null) {
    localStorage.setItem('userName', 'Alice');
  }

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/submit-time-page">Amplify Cares</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
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
                Self Care Data
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
              <Nav.Link as={Link} to="https://microsoft-my.sharepoint-df.com/:w:/p/sidm/ES-DIlQMHbJEgLz9cLSRcSsBdieBfDoaM-r5-cAjWcBwMw?e=hPhdPs">The Hypothesis behind AmplifyCares</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet />
    </>
  )
};

export default Layout;
