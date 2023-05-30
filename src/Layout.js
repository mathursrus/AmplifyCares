import 'bootstrap/dist/css/bootstrap.min.css';
import { Outlet, Link } from "react-router-dom";
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Navbar from "react-bootstrap/Navbar";
import * as microsoftTeams from '@microsoft/teams-js';

function Layout() {        

  const accessToken = "eyJ0eXAiOiJKV1QiLCJub25jZSI6IjFGNFNQRTNTdjJrektUOXBrVFlVM1p2NnpQb1Q0ZDZMbnJpQ0NYWEFraDAiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9hMmI4MzUwOS0zYzVmLTQ4MDItODIwYi1hODI0MjY1YzI1MWYvIiwiaWF0IjoxNjg1NDA1NDEzLCJuYmYiOjE2ODU0MDU0MTMsImV4cCI6MTY4NTQ5MjExNCwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFUUUF5LzhUQUFBQTVkZXdzSUF6SFlwVlQ0L2gzMktMTVBZdEJ2K0ZhTXpkUktMU0kwQkZaa0ZrUS9pU0s0bXJpYTFudnQ0RDZhODYiLCJhbXIiOlsicHdkIl0sImFwcF9kaXNwbGF5bmFtZSI6IkdyYXBoIEV4cGxvcmVyIiwiYXBwaWQiOiJkZThiYzhiNS1kOWY5LTQ4YjEtYThhZC1iNzQ4ZGE3MjUwNjQiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6Ik1hdGh1ciIsImdpdmVuX25hbWUiOiJTaWQiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIyMC4yNS4xNzguOTAiLCJuYW1lIjoiU2lkIE1hdGh1ciIsIm9pZCI6ImQ2NTQwMGVhLTc4NTQtNDc0YS1iNmYyLWUzNmMyYWM4MzYyNiIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwMkEzRjk0QkM2IiwicmgiOiIwLkFWQUFDVFc0b2w4OEFraUNDNmdrSmx3bEh3TUFBQUFBQUFBQXdBQUFBQUFBQUFCUUFFSS4iLCJzY3AiOiJBcHBsaWNhdGlvbi5SZWFkLkFsbCBBcHBsaWNhdGlvbi5SZWFkV3JpdGUuQWxsIERpcmVjdG9yeS5BY2Nlc3NBc1VzZXIuQWxsIERpcmVjdG9yeS5SZWFkLkFsbCBEaXJlY3RvcnkuUmVhZFdyaXRlLkFsbCBvcGVuaWQgcHJvZmlsZSBTZXJ2aWNlSGVhbHRoLlJlYWQuQWxsIFVzZXIuUmVhZCBlbWFpbCIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6IjhBRkUwYWQwOTZRVTNHaXVmNDUtZGk2bERFRC1FUFdiNTJNVDZHemRMYUUiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiJhMmI4MzUwOS0zYzVmLTQ4MDItODIwYi1hODI0MjY1YzI1MWYiLCJ1bmlxdWVfbmFtZSI6InNpZEBjYXRpdGEzNjUub25taWNyb3NvZnQuY29tIiwidXBuIjoic2lkQGNhdGl0YTM2NS5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJPTGo5dnItbllVQ1J5R08wOGRTVkFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyI2OTA5MTI0Ni0yMGU4LTRhNTYtYWE0ZC0wNjYwNzViMmE3YTgiLCJmZTkzMGJlNy01ZTYyLTQ3ZGItOTFhZi05OGMzYTQ5YTM4YjEiLCJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2NjIjpbIkNQMSJdLCJ4bXNfc3NtIjoiMSIsInhtc19zdCI6eyJzdWIiOiJjalBlZHNCS2pTdEpmUXdZYVlneFpfWHh0MlFrZlRLdy1XdHhiZzZ1Sk1ZIn0sInhtc190Y2R0IjoxNjI1ODU0NzM4fQ.QyRn0tyvh7emynZcH_UQZRGIkBbrfESQykEf3KVGK0bX8Cvlwy5YMfMTgrXd0EZomiDZpD8x46ZNkMM4kFkxypk3B2rYN8QPG9NcobdBEi1AwQus5JFSsOQRCEnZyrJSSnYqGy1Pi1ITSQHOMmHqu79LQUD_einHpeKRNi0JqoKvqQ6j4ZRu4cy3Q9qAI5APl8IxP-gTWFLOf5RB35uRjbybYcyT4y7jgYx0FJgkwAKWHyH6JUP0FotthhPHAxbo5SJqovqAjoDa7VYo_LRDkRylz7em3H6IsCxzQ75wvZ214QWAPZ59Dy1FlsjFm9V9J6UbwnCdVyWG7I7gRPn6GQ";

  localStorage.setItem('userName', 'Alice');
  localStorage.setItem('userDisplayName', 'Al');

  try {
    microsoftTeams.initialize();
    microsoftTeams.getContext((context) => {
        console.log(context.userPrincipalName);
        const upn = context.userPrincipalName;
        debugger;
        fetch(`https://graph.microsoft.com/v1.0/users/${upn}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        .then(response => response.json())
        .then(data => {
          localStorage.setItem('userDisplayName', data.givenName);
          localStorage.setItem('userName', upn);  
          console.log("Set context In Teams ", upn, ", ", data.givenName);
        });            
    });
  }  catch (e) {    
    console.log("Code is not running in Microsoft Teams environment.");
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