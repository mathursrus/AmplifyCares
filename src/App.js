import Leaderboard from "./Leaderboard";
import SubmitTimePage from "./SubmitTime";
import SummaryPage from "./SummaryPage";
import TeamList from "./TeamList";
import LogoutSuccessPage from './Logout';
import FirstRunExperience from './FirstRunExperience';
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from "./Layout";
import FeedbackWidget from "./FeedbackWidget";
import { PublicClientApplication, LogLevel } from '@azure/msal-browser';
import { getApiHost } from './utils/urlUtil';
import * as microsoftTeams from "@microsoft/teams-js";
import { features } from "./FirstRunExperience";
import './App.css';
import { refreshUserInfo } from "./utils/userUtil";
import SelfCareCoach from "./SelfCareCoach";
import Goals from "./Goals";

const config = {
  auth: {
    //clientId: "93b00364-cb1c-49c6-8564-3709d70ad224",
    clientId: "1adf639b-57f8-4bb9-9c02-f5f51cd00c13",
    //authority: "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
    logoutRedirect: window.location.origin + "?logout=true",
    consentScopes: [],
    navigateToLoginRequestUrl: true,
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

  const [logoutComplete, setLogoutComplete] = useState(false);
  const user = useRef(null);
  const [userExists, setUserExists] = useState(false);
  const [inTeams, setInTeams] = useState(false);
  const [showFirstRunExperience, setShowFirstRunExperience] = useState(0);
  const AUTH_STATE = "authentication_state";
  const AUTH_STATE_VALUES = {
    AUTHENTICATING: "authenticating",
    AUTHENTICATED: "authenticated",
    LOGGING_OUT: "logging_out",
    LOGGED_OUT: "logged_out",
  }
  const msalInstance = useMemo(() => new PublicClientApplication(config), []);

  // Function to handle closing the first-run experience modal
  const handleCloseFirstRunExperience = () => {
    console.log("Turning off FRE");
    setUserLogin();
    setShowFirstRunExperience(0);
  };

  const setUserBadges = useCallback(async (badges) => {
    const temp_badges = [
    { badgelisttype: 'current', badgelist: [
      { badgetype: 'streak', badgetext: 'Get a 30 day streak of self care'} ,
      { badgetype: 'rookie', badgetext: 'You are new to the app, Be the Rookie of the month' },
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
    await localStorage.setItem('badges', JSON.stringify(temp_badges));        
  }, []);

  // Update the last login time of a user or add a new user
  const updateUserLastLogin = useCallback(async (lastLogin) => {
    console.log("Got last login of ", lastLogin);
    localStorage.setItem('lastLogin', lastLogin);
    // if the user has logged in before and it's been more than 1 seconds ago, dont show FRE
    if (!lastLogin) {
      console.log("Show FRE here");
      setShowFirstRunExperience(1);
    } else if (new Date(features[0].date) > new Date(lastLogin)) {
      console.log("Show WhatsNew here");
      setShowFirstRunExperience(3);      
    }
    else {
      console.log("Nothing to show here");
      setShowFirstRunExperience(0);
      setUserLogin();      
    }
    //sendNotification(username);
  }, []);

  const getAndSetUserInfo = useCallback(async (token) => {
    const userInfo = await refreshUserInfo(token);
    let badges = null;
    let lastLogin = null;
    console.log("Got user info ", userInfo);
    console.log("Reading from localstorgea user info ", JSON.parse(localStorage.getItem('userDetails')));
    badges = userInfo.badgesOnTrack;
    lastLogin = userInfo.lastLoginTime;            
    await setUserBadges(badges);
    console.log("Badges is ", JSON.parse(localStorage.getItem('badges')));         
    updateUserLastLogin(lastLogin);
  }, [setUserBadges, updateUserLastLogin]);

  const setUser = useCallback(async (response) => {
    console.log("Set user called with ", response);
    if (response) {
      user.current = response[1];
      localStorage.setItem('usertoken', response[0]);          
      localStorage.setItem('userName', response[1]);
      localStorage.setItem('userDisplayName', response[2]);
      localStorage.setItem(AUTH_STATE, AUTH_STATE_VALUES.AUTHENTICATED);
      await getAndSetUserInfo(response[0]); 
      setUserExists(true);             
    }
    else {
      user.current = null;
      localStorage.setItem('usertoken', null);          
      localStorage.setItem('userName', null);
      localStorage.setItem('userDisplayName', null);
      localStorage.setItem('badges', null);
      localStorage.setItem(AUTH_STATE, AUTH_STATE_VALUES.LOGGED_OUT);

      setUserExists(false);
      console.log("User set to null");
    }
  }, [AUTH_STATE_VALUES.AUTHENTICATED, AUTH_STATE_VALUES.LOGGED_OUT, getAndSetUserInfo]);

  
  const setUserLogin = () => {
    fetch(getApiHost() + `/setUserLogin?user=${localStorage.getItem('userName')}&logintime=${(new Date()).toISOString()}`);      
  }

  const login = useCallback(async () => {    
    console.log("In Login, Authenticating is ", localStorage.getItem(AUTH_STATE));
    try {      
      msalInstance.handleRedirectPromise().then(authResult => {
        console.log("Handle redirect promise called with auth ", authResult);
        if (authResult && authResult.account) {
          const account = authResult.account;
          console.log("Setting active account to ", account);
          msalInstance.setActiveAccount(account);
          console.log("Got MSALInstance token ", authResult.accessToken);
          setUser([authResult.idToken, account.username, account.name]);
        }
        else {
          setUser(null);
        }
      }).catch(err => {
        console.log(err);
      });

      await msalInstance.loginRedirect();

    } catch (error) {
      console.log('Login failed:', error);          
    }      
  }, [msalInstance, setUser]);

  

  useEffect(() => {
    const checkAuthentication = async () => {
      localStorage.setItem(AUTH_STATE, AUTH_STATE_VALUES.AUTHENTICATING);
      
      try {
        await microsoftTeams.app.initialize();
        setInTeams(true);
        console.log("In Teams");
        try{
          microsoftTeams.app.notifySuccess();          
        }
        catch (error) {
          console.log("Its ok to ignore this error, not in config state ", error);
        }

        const context = await microsoftTeams.app.getContext();
        const userName = await context.user.userPrincipalName;
        console.log('User Name:', userName);
        console.log('Context:', context);
        console.log('App Resource:', microsoftTeams.authentication);
        console.log('Iframe Origin:', window.location.origin); 

          
        await microsoftTeams.authentication.getAuthToken({
          successCallback: function(token) { 
            console.log("Success: ", token); 
            // Split the token into header, payload, and signature
            const [headerB64, payloadB64] = token.split('.');

            // Decode the base64-encoded header and payload
            const header = JSON.parse(atob(headerB64));
            const payload = JSON.parse(atob(payloadB64));
            
            console.log('Decoded Header:', header);
            console.log('Decoded Payload:', payload);
            
            if (payload.name) {
              setUser([token, userName, payload.name]);             
            } else {
              console.log('Graph API call did not return display name');
              setUser([token, userName, userName]);     
            }
          },
          failureCallback: function(error) { console.log("Error getting token: " + error); }
        }); 
      } catch (e) // not in teams
      {
        console.log("Not in Teams ", window.location.search);

        const isLogoutRedirect = window.location.search.includes("logout=true");
        if (isLogoutRedirect) {
          localStorage.setItem(AUTH_STATE, AUTH_STATE_VALUES.LOGGING_OUT);
      
          console.log("Redirected from logout");
          localStorage.removeItem('userName');
          localStorage.removeItem('userDisplayName');
          setUser(null);
          msalInstance.setActiveAccount(null);
          setLogoutComplete(true);
        } else {
          const account = await msalInstance.getActiveAccount();
          console.log("Got account from stack ", account);
          if (account) {
            /*const response = await msalInstance.acquireTokenSilent({
              account: account,
              scopes: ['user.read']
            });*/
            const response = await msalInstance.acquireTokenSilent({account: account});                    
            setUser([response.idToken, account.username, account.name]);
            console.log('User already authenticated:', account.username);
          } else {
            login();
          }
        }
      }      
    }

    const current_auth_state = localStorage.getItem(AUTH_STATE);
    var desired_state = AUTH_STATE_VALUES.AUTHENTICATING;
    if (window.location.href.includes("logout")) {
      desired_state = AUTH_STATE_VALUES.LOGGING_OUT;
    }
    
    console.log("Current state is ", current_auth_state, ", deired state is ", desired_state, ", Window is ", window);
    
    //if (current_auth_state === null || current_auth_state === "" || current_auth_state !== desired_state) {
      try {    
        console.log("Trying to initiatlize with location ", window, " and parent ", window.parent);           
        checkAuthentication();
      } catch (error) {
        console.log('Authentication failed:', error);          
      }
    //} else {
      //console.log("Ignoring auth since state is ", current_auth_state);
    //}
  }, [AUTH_STATE_VALUES.AUTHENTICATING, AUTH_STATE_VALUES.LOGGING_OUT, login, msalInstance, setUser]);     

  const handleLogout = async (event) => {
    //event.preventDefault();
    console.log("Called logout");
    msalInstance.handleRedirectPromise().then(authResult => {
      console.log("Logout redirect promise with auth ", authResult);
      msalInstance.setActiveAccount(null);
      setUser(null);
      //window.location.href = window.location.origin + `?logout=true`;
    }).catch(err => {
      console.log(err);
    });    

    msalInstance.logoutRedirect({
      account: msalInstance.getActiveAccount(),
      postLogoutRedirectUri: window.location.origin + `?logout=true`
    });
  };

  return (
    <div>              
      {userExists ? (
        <div className="App">                    
          <Routes>
            <Route path="/" element={<Layout />}>              
              <Route index element={<SubmitTimePage />} />
              <Route path="summary-page" element={<SummaryPage />} />              
              <Route path="submit-time-page" element={<SubmitTimePage />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="team-list" element={<TeamList />} />
              <Route path="self-care-coach" element={<SelfCareCoach />} />
              <Route path="goals" element={<Goals />} />
            </Route>
          </Routes>
          <FeedbackWidget />
          {!(inTeams) && (
            <div>
              <button className="sign-out-button" onClick={handleLogout}>
                <img className="signout-icon" src='signout.png' alt='Sign Out' title='Sign Out' />            
              </button>
            </div>
          )}
          {showFirstRunExperience > 0 && <FirstRunExperience screen={showFirstRunExperience} onClose={handleCloseFirstRunExperience} />}          
        </div>
      ) : logoutComplete ? (
        <div className="App">
          <LogoutSuccessPage />          
        </div>
      ) : (
        <div className="App">Authenticating</div>
      )}
    </div>
  );
}


export default App;
