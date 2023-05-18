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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({origin:"*"}));

app.use('/', indexRouter);

app[writeSelfCareEntry.method](writeSelfCareEntry.path, writeSelfCareEntry.handler);
app[getSelfCareStats.method](getSelfCareStats.path, getSelfCareStats.handler);
app[getPercentiles.method](getPercentiles.path, getPercentiles.handler);
app[getIndividualStats.method](getIndividualStats.path, getIndividualStats.handler);
app[getTeamList.method](getTeamList.path, getTeamList.handler);
app[getTeamStats.method](getTeamStats.path, getTeamStats.handler);

module.exports = app;
