require('dotenv').config()
const { HubConnectionBuilder, LogLevel } = require('@microsoft/signalr');
const { v4: uuidv4 } = require('uuid');

var cors = require('cors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');

var app = express();

var routesModules = require('./routes');
var getSecretKeyForUser = routesModules.getSecretKeyForUser;
var getUserFromSecretKey = routesModules.getUserFromSecretKey;
var getUserInfoWithToken = routesModules.getUserInfoWithToken;
/*var getUserInfo = routesModules.getUserInfo;*/
var setUserLoginInfo = routesModules.setUserLoginInfo;
var getAllUsers = routesModules.getAllUsers;
var writeSelfCareEntryWithToken = routesModules.writeSelfCareEntryWithToken;
//var writeSelfCareEntry = routesModules.writeSelfCareEntry;
var getSelfCareStats = routesModules.getSelfCareStats;
var getPercentiles = routesModules.getPercentiles;
var getTeamStats = routesModules.getTeamStats;
var getIndividualData = routesModules.getIndividualData;
var getActivities = routesModules.getActivities;
var getTeamList = routesModules.getTeamList;
var getSelfCareInsights = routesModules.getSelfCareInsights;
var getTimeInputFromSpeech = routesModules.getTimeInputFromSpeech;
var writeRecommendation = routesModules.writeRecommendation;
var readRecommendations = routesModules.getRecommendations;
var writeRecommendationComment = routesModules.writeRecommendationComment;
var readRecommendationComments = routesModules.getRecommendationComments;
var writeReactionToComment = routesModules.writeReactionToComment;
var writeFeedback = routesModules.writeFeedback;
var sendInvite = routesModules.sendInvite;
var getDailyChallenges = routesModules.getDailyChallenges;
var getUserGoals = routesModules.getUserGoals;
var writeUserGoals = routesModules.writeUserGoals;
var seekCoaching = routesModules.seekCoaching;
var checkNotifications = routesModules.checkNotifications;
var addNotificationSubscription = routesModules.addNotificationSubscription;
var removeNotificationSubscription = routesModules.removeNotificationSubscription;

async function startSignalRHub() {
  console.log("Starting hub");

  const hubConnection = new HubConnectionBuilder()
    .withUrl(process.env.SIGNALR_HUB_CONNECTION) // Update the URL to match your server's URL
    .configureLogging(LogLevel.Information)
    .build();

  try {
    await hubConnection.start();
    console.log('SignalR hub connection established.');

    // Define hub event handlers
    hubConnection.on('CacheRefreshNotification', () => {
      console.log('Cache refresh notification received. Refreshing cache...');
      // Perform cache refresh logic, e.g., emit an event or send a response to connected clients
    });
  } catch (err) {
    console.error('Error starting SignalR hub connection:', err);
  }
}

// Log requests and responses
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url, req.item);
  res.on('finish', () => {
    console.log('Outgoing response:', res.statusCode);
  });
  next();
});


// Enable CORS
app.use(cors());

// Increase the request size limit to handle larger payloads
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.json({ limit: '100mb' }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

// Handle OPTIONS requests for writeFeedback endpoint
app.options('/writeFeedback', (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Respond with a 200 status
  res.sendStatus(200);
});

app.use('/', indexRouter);
app[getSecretKeyForUser.method](getSecretKeyForUser.path, getSecretKeyForUser.handler);
app[getUserFromSecretKey.method](getUserFromSecretKey.path, getUserFromSecretKey.handler);
app[getUserInfoWithToken.method](getUserInfoWithToken.path, getUserInfoWithToken.handler);
/*app[getUserInfo.method](getUserInfo.path, getUserInfo.handler);*/
app[setUserLoginInfo.method](setUserLoginInfo.path, setUserLoginInfo.handler);
app[getAllUsers.method](getAllUsers.path, getAllUsers.handler);
app[writeSelfCareEntryWithToken.method](writeSelfCareEntryWithToken.path, writeSelfCareEntryWithToken.handler);
//app[writeSelfCareEntry.method](writeSelfCareEntry.path, writeSelfCareEntry.handler);
app[getSelfCareStats.method](getSelfCareStats.path, getSelfCareStats.handler);
app[getPercentiles.method](getPercentiles.path, getPercentiles.handler);
app[getIndividualData.method](getIndividualData.path, getIndividualData.handler);
app[getActivities.method](getActivities.path, getActivities.handler);
app[getTeamList.method](getTeamList.path, getTeamList.handler);
app[getTeamStats.method](getTeamStats.path, getTeamStats.handler);
app[getSelfCareInsights.method](getSelfCareInsights.path, getSelfCareInsights.handler);
app[getTimeInputFromSpeech.method](getTimeInputFromSpeech.path, getTimeInputFromSpeech.handler);
app[writeRecommendation.method](writeRecommendation.path, writeRecommendation.handler);
app[readRecommendations.method](readRecommendations.path, readRecommendations.handler);
app[writeRecommendationComment.method](writeRecommendationComment.path, writeRecommendationComment.handler);
app[readRecommendationComments.method](readRecommendationComments.path, readRecommendationComments.handler);
app[writeReactionToComment.method](writeReactionToComment.path, writeReactionToComment.handler);
app[writeFeedback.method](writeFeedback.path, writeFeedback.handler);
app[sendInvite.method](sendInvite.path, sendInvite.handler);
app[getDailyChallenges.method](getDailyChallenges.path, getDailyChallenges.handler);
app[getUserGoals.method](getUserGoals.path, getUserGoals.handler);
app[writeUserGoals.method](writeUserGoals.path, writeUserGoals.handler);
app[seekCoaching.method](seekCoaching.path, seekCoaching.handler);
app[checkNotifications.method](checkNotifications.path, checkNotifications.handler);
app[addNotificationSubscription.method](addNotificationSubscription.path, addNotificationSubscription.handler);
app[removeNotificationSubscription.method](removeNotificationSubscription.path, removeNotificationSubscription.handler);  

app.post('/hub/negotiate', (req, res) => {  
  console.log('Received negotiation request:', req.body);

  const connectionId = uuidv4();

  const negotiationResponse = {
    url: process.env.SIGNALR_HUB_CONNECTION, // Update the URL if necessary
    accessToken: 'AmplifyCares',
    connectionId: connectionId
  };

  console.log('Sending negotiation response:', negotiationResponse);
  res.status(200).json(negotiationResponse);
});

module.exports = app;

//startSignalRHub();
