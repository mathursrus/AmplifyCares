var cors = require('cors');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');

var app = express();

var routesModules = require('./routes');
var writeSelfCareEntry = routesModules.writeSelfCareEntry;
var getSelfCareStats = routesModules.getSelfCareStats;
var getPercentiles = routesModules.getPercentiles;
var getTeamStats = routesModules.getTeamStats;
var getIndividualStats = routesModules.getIndividualStats;
var getTeamList = routesModules.getTeamList;
var writeRecommendation = routesModules.writeRecommendation;
var readRecommendations = routesModules.getRecommendations;
var writeFeedback = routesModules.writeFeedback;

// Increase the request size limit to handle larger payloads
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.json({ limit: '100mb' }));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({origin:"*"}));

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

app[writeSelfCareEntry.method](writeSelfCareEntry.path, writeSelfCareEntry.handler);
app[getSelfCareStats.method](getSelfCareStats.path, getSelfCareStats.handler);
app[getPercentiles.method](getPercentiles.path, getPercentiles.handler);
app[getIndividualStats.method](getIndividualStats.path, getIndividualStats.handler);
app[getTeamList.method](getTeamList.path, getTeamList.handler);
app[getTeamStats.method](getTeamStats.path, getTeamStats.handler);
app[writeRecommendation.method](writeRecommendation.path, writeRecommendation.handler);
app[readRecommendations.method](readRecommendations.path, readRecommendations.handler);
app[writeFeedback.method](writeFeedback.path, writeFeedback.handler);

module.exports = app;
