import Leaderboard from "./Leaderboard";
import SubmitTimePage from "./SubmitTime";
import SummaryPage from "./SummaryPage";
import TeamList from "./TeamList";
import LogoutSuccessPage from './Logout';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from "./Layout";
import FeedbackWidget from "./FeedbackWidget";
import { PublicClientApplication, LogLevel } from '@azure/msal-browser';
import './App.css';

const config = {
  auth: {
    clientId: "93b00364-cb1c-49c6-8564-3709d70ad224",
    authority: "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47",
    //redirectUri: window.location.origin,
    consentScopes: [],
    navigateToLoginRequestUrl: false,
    ssoSilent: true
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
        loggerCallback: (level: LogLevel, message: string, containsPii: boolean): void => {
            if (containsPii) {
                return;
            }
            switch (level) {
                case LogLevel.Error:
                    console.error(message);
                    return;
                case LogLevel.Info:
                    console.info(message);
                    return;
                case LogLevel.Verbose:
                    console.debug(message);
                    return;
                case LogLevel.Warning:
                    console.warn(message);
                    return;
                default: 
                    return;
            }
        },
        piiLoggingEnabled: false
      },
      windowHashTimeout: 60000,
      iframeHashTimeout: 6000,
      loadFrameTimeout: 0,
      asyncPopups: false
  },
  telemetry: {
      application: {
          appName: "Amplify Cares",
          appVersion: "1.0.0"
      }
  }
};

function App() {
  return (
    <BrowserRouter>
      <AppPage />
    </BrowserRouter>
  );
}

function AppPage() {
  const msalInstance = useMemo(() => new PublicClientApplication(config), []);
  //const [user, setUser] = useState(null);
  const [logoutComplete, setLogoutComplete] = useState(false);
  const user = useRef(null);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const isLogoutRedirect = window.location.search.includes("logout=true");
      if (isLogoutRedirect) {
        console.log("Redirected from logout");
        localStorage.removeItem('userName');
        localStorage.removeItem('userDisplayName');
        localStorage.setItem('authenticating', "0");
        setUser(null);
        setLogoutComplete(true);
      } else {
        const accounts = await msalInstance.getAllAccounts();
        console.log("Got accounts ", accounts);
        if (accounts.length > 0) {
          const response = await msalInstance.acquireTokenSilent({
            account: accounts[0],
            scopes: ['user.read']
          });
          setUser(response);
          console.log('User already authenticated:', response.account.username);
        } else {
          login();
        }
      }      
    }
    checkAuthentication();
  }); 

    const login = async () => {
      const loginRequest = {
        scopes: ['user.read']
      };

      console.log("Authenticating is ", localStorage.getItem('authenticating'));
      if (localStorage.getItem('authenticating') === null || localStorage.getItem('authenticating') === "0") {
        try {
          localStorage.setItem('authenticating', "1");
          const response = await msalInstance.loginPopup(loginRequest);
          setUser(response);          
          console.log('User successfully logged in:', response.account.username);
        } catch (error) {
          console.log('Login failed:', error);          
        }
        finally {
          localStorage.setItem('authenticating', "0");
        }
      } else {
        console.log("Auth already in progress");
      }
    };

    const setUser = (response) => {
      console.log("Set user called with ", response);
      if (response) {
        // get badges
        user.current = response.account.username;
        localStorage.setItem('userName', response.account.username);
        localStorage.setItem('userDisplayName', response.account.name);
        const badges = [
          { badgelisttype: 'current', badgelist: [
            { badgetype: 'streak', badgetext: 'Get a 30 day streak of self care'} ,
            { badgetype: 'rookie', badgetext: 'Youre New to the app, Be the Rookie of the month' },
            { badgetype: 'winner', badgetext: 'Be among the top 10% of self care for the month' },
            { badgetype: 'team', badgetext: 'Help your team top the leaderboard' },
          ]},
          {badgelisttype: 'historical', badgelist: [
            /*{ badgetype: 'winner', badgetext: 'June iCare champ' },
            { badgetype: 'rookie', badgetext: 'May iCare Rookie of month' },
            { badgetype: 'streak', badgetext: '30-day streak' },
            { badgetype: 'team', badgetext: 'June weCare champ' },*/
          ]},
        ];
        
        localStorage.setItem('badges', JSON.stringify(badges));
        setUserExists(true);
        console.log("Badges is ", JSON.parse(localStorage.getItem('badges')));
      }
      else {
        user.current = null;
        localStorage.setItem('userName', null);
        localStorage.setItem('userDisplayName', null);
        localStorage.setItem('badges', null);
        setUserExists(false);
        console.log("User set to null");
      }
    };
 

  const handleLogout = async (event) => {
    //event.preventDefault();
    console.log("Called logout");
    
    msalInstance.logoutPopup({
      //postLogoutRedirectUri: window.location.origin + `?logout=true`
    })
      .catch((error) => {
        console.log("Logout failed ", error);
      })
      .finally(() => {
        console.log("Logout operation completed.");
        window.location.href = window.location.origin + `?logout=true`;
      });
  };

  return (
    <div>
      {userExists ? (
        <div className="App">          
          <Routes>
            <Route path="/" element={<Layout />}>              
              <Route index element={<SummaryPage />} />
              <Route path="summary-page" element={<SummaryPage />} />              
              <Route path="submit-time-page" element={<SubmitTimePage />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="team-list" element={<TeamList />} />
            </Route>
          </Routes>
          <FeedbackWidget />
          <button className="sign-out-button" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      ) : logoutComplete ? (
        <div className="App">
          <LogoutSuccessPage />          
        </div>
      ) : (
        <div className="App">Authenticating...</div>
      )}
    </div>
  );
}

export default App;
