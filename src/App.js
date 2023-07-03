import Leaderboard from "./Leaderboard";
import SubmitTimePage from "./SubmitTime";
import SummaryPage from "./SummaryPage";
import TeamList from "./TeamList";
import LogoutSuccessPage from './Logout';
import React, { useEffect, useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from "./Layout";
import FeedbackWidget from "./FeedbackWidget";
import './FeedbackWidget.css';
import { PublicClientApplication } from '@azure/msal-browser';

const config = {
  auth: {
    clientId: "93b00364-cb1c-49c6-8564-3709d70ad224",
    authority: "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47",
    redirectUri: window.location.origin,
    consentScopes: [],
    navigateToLoginRequestUrl: false,
    ssoSilent: true
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
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

  const [user, setUser] = useState(null);
  const [logoutComplete, setLogoutComplete] = useState(false);

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
          setUser(response.account.username);
          console.log('User already authenticated:', response.account.username);
        } else {
          login();
        }
      }
    };

    const login = async () => {
      const loginRequest = {
        scopes: ['user.read']
      };

      console.log("Authenticating is ", localStorage.getItem('authenticating'));
      if (localStorage.getItem('authenticating') === null || localStorage.getItem('authenticating') === "0") {
        try {
          localStorage.setItem('authenticating', "1");
          const response = await msalInstance.loginPopup(loginRequest);
          await setUser(response.account.username);
          localStorage.setItem('userName', response.account.username);
          localStorage.setItem('userDisplayName', response.account.name);
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

    checkAuthentication();
  }, [msalInstance]);

  const handleLogout = async (event) => {
    event.preventDefault();
    console.log("Called logout");
    
    msalInstance.logout({
      postLogoutRedirectUri: window.location.origin + `?logout=true`
    })
      .catch((error) => {
        console.log("Logout failed ", error);
      })
      .finally(() => {
        console.log("Logout operation completed.");
      });
  };

  return (
    <div>
      {user ? (
        <div>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<SubmitTimePage />} />
              <Route path="submit-time-page" element={<SubmitTimePage />} />
              <Route path="summary-page" element={<SummaryPage />} />
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
        <div>
          <LogoutSuccessPage />          
        </div>
      ) : (
        <div>Authenticating...</div>
      )}
    </div>
  );
}

export default App;
