import 'bootstrap/dist/css/bootstrap.min.css';
import { Outlet, Link } from "react-router-dom";
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Navbar from "react-bootstrap/Navbar";
import * as microsoftTeams from '@microsoft/teams-js';

function Layout() {

  if (microsoftTeams) {
    microsoftTeams.initialize();
    microsoftTeams.getContext((context) => {
        console.log(context.userPrincipalName);
        localStorage.setItem('userName', context.userPrincipalName);
        localStorage.setItem('userDisplayName', context.displayName);
    });
  } 

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container>
            <Navbar.Brand as={Link} to="/submit-time-page">Amplify Cares</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
                <Nav.Link as={Link} to="/submit-time-page">Submit Time</Nav.Link>
                <Nav.Link as={Link} to="/summary-page">Self Care Data</Nav.Link>
                <Nav.Link as={Link} to="/leaderboard">Leaderboard</Nav.Link>
                <Nav.Link as={Link} to="/team-list">Team List</Nav.Link>                
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