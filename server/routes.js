const handlers = require('./handlers');

const getUserInfoWithToken = {
    method: 'get',
    path: '/getUserInfoWithToken',
    handler: async (req, res) => {
        console.log("Got req: ", req.query);
        const token = await req.headers.authorization.split(' ')[1];        
        const response = await handlers.getUserInfoWithToken(token);
        res.status(200).json(response);
    }
}

/*
const getUserInfo = {
    method: 'get',
    path: '/getUserInfo',
    handler: async (req, res) => {
        console.log("Got req: ", req.query);
        const item = await req.query.user;        
        const response = await handlers.getUserInfo(JSON.parse(item));
        res.status(200).json(response);
    }
}
*/

const setUserLoginInfo = {
    method: 'get',
    path: '/setUserLogin',
    handler: async (req, res) => {
        console.log("Got req: ", req.query);
        const user = await req.query.user;        
        const logintime = await req.query.logintime;        
        const response = await handlers.setUserLoginInfo(user, logintime);
        res.status(200).json(response);
    }
}

const getAllUsers = {
    method: 'get',
    path: '/getAllUsers',
    handler: async (req, res) => {
        console.log("Got req: ", req.query);
        const domain = await req.query.domain;       
        const response = await handlers.getAllUsers(domain);
        res.status(200).json(response);
    }
}

const writeSelfCareEntryWithToken = {
    method: 'get',
    path: '/writeselfcarewithtoken',
    handler: async (req, res) => {
        console.log("Got req: ", req.query);
        const item = await req.query.item;        
        const token = await req.headers.authorization.split(' ')[1];
        const response = await handlers.writeEntryWithToken(JSON.parse(item), token);
        res.status(200).json(response);
    }
}

/*
const writeSelfCareEntry = {
    method: 'get',
    path: '/writeselfcare',
    handler: async (req, res) => {
        console.log("Got req: ", req.query);
        const item = await req.query.item;        
        const response = await handlers.writeEntry(JSON.parse(item));
        res.status(200).json(response);
    }
}
*/

const getSelfCareStats = {
    method: 'get',
    path: '/getselfcarestats',
    handler: async (req, res) => {
        console.log("Got req: ", req.query);
        const item = await req.query.item;  
        const startDay = await req.query.startDay;
        const endDay = await req.query.endDay;
        const category = await req.query.category;
        console.log("Got self care stats request: ", item, startDay, endDay, category);      
        const response = await handlers.readEntries(item, startDay, endDay, category);
        res.status(200).json(response);
    }
}

const getPercentiles = {
    method: 'get',
    path: '/getpercentiles',
    handler: async (req, res) => {
        console.log("Got perc req: ", req.query);
        const item = await req.query.item;  
        const startDay = await req.query.startDay;
        const endDay = await req.query.endDay;
        const category = await req.query.category;
        console.log("Got perc request: ", item, startDay, endDay, category);
        const response = await handlers.readPercentile(item, startDay, endDay, category);
        res.status(200).json(response);
    }
}

const getIndividualData = {
    method: 'get',
    path: '/getselfcaredata',
    handler: async (req, res) => {
        console.log("Got individual data req: ", req.query);
        const item = await req.query.item;
        const date = await req.query.date;
        const response = await handlers.readIndividualData(item, date);
        res.status(200).json(response);
    }
}

const getActivities = {
    method: 'get',
    path: '/getselfcareactivities',
    handler: async (req, res) => {
        console.log("Got individual activities req: ", req.query);
        const item = await req.query.item;
        const startDay = await req.query.startDay;
        const endDay = await req.query.endDay;
        const response = await handlers.readActivities(item, startDay, endDay);
        res.status(200).json(response);
    }
}

const getTeamList = {
    method: 'get',
    path: '/getteamlist',
    handler: async (req, res) => {
        console.log("Got team list req: ", req.query);
        const response = await handlers.readTeamList();
        res.status(200).json(response);
    }
}

const getTeamStats = {
    method: 'get',
    path: '/getteamstats', 
    handler: async (req, res) => {
        const urlParams = new URLSearchParams(req.query);
        console.log("Got team stats req: ", req.query, ", with startDay: `", urlParams.get('startDay'), "`, endDay: `", urlParams.get('endDay') + "`");
        const response = await handlers.readTeamStats(urlParams.get('startDay'), urlParams.get('endDay'));

        res.status(200).json(response);
    }
}

const getSelfCareInsights = {
    method: 'post',
    path: '/getselfcareinsights', 
    handler: async (req, res) => {
        const questions = req.body.questions; 
        const user = req.body.username; 
        const startDay = req.body.startDay;
        const endDay = req.body.endDay;
        const response = await handlers.getSelfCareInsights(user, startDay, endDay, questions);

        res.status(200).json(response);
    }
}

const getTimeInputFromSpeech = {
    method: 'post',
    path: '/gettimeinput', 
    handler: async (req, res) => {
        const item = req.body.item; 
        const user = req.body.username; 
        const timezone = req.body.timezone;
        const response = await handlers.getTimeInputFromSpeech(user, item, timezone);

        res.status(200).json(response);
    }
}

const writeRecommendation = {
    method: 'post',
    path: '/writerecommendation', 
    handler: async (req, res) => {
        const item = req.body.item; 
        const response = await handlers.writeRecommendation(item); 
        res.status(200).json(response);
    }
}

const getRecommendations = {
    method: 'get',
    path: '/getRecommendations', 
    handler: async (req, res) => {
        const item = parseInt(await req.query.item); 
        const user = await req.query.user; 
        console.log("Got reco item: ", item, ", and user ", user);      
        const response = await handlers.getRecommendations(item, user);

        res.status(200).json(response);
    }
}

const writeRecommendationComment = {
    method: 'post',
    path: '/writerecommendationcomment', 
    handler: async (req, res) => {
        const item = req.body.item; 
        const response = await handlers.writeRecommendationComment(item); 
        res.status(200).json(response);
    }
}

const getRecommendationComments = {
    method: 'get',
    path: '/getRecommendationComments', 
    handler: async (req, res) => {
        const item = await req.query.item; 
        console.log("Got reco item: ", item);      
        const response = await handlers.getRecommendationComments(item);

        res.status(200).json(response);
    }
}

const writeReactionToComment = {
    method: 'post',
    path: '/writereactiontocomment', 
    handler: async (req, res) => {
        const item = req.body.item; 
        const response = await handlers.writeReactionToComment(item); 
        res.status(200).json(response);
    }
}

const writeFeedback = {
    method: 'post',
    path: '/writeFeedback', 
    handler: async (req, res) => {
        const item = req.body.item;  
        const response = await handlers.writeFeedback(item);

        res.status(200).json(response);
    }
}

const sendInvite = {
    method: 'get',
    path: '/sendInvite', 
    handler: async (req, res) => {
        const item = req.query.invite;  
        const response = await handlers.sendInvite(JSON.parse(item));

        res.status(200).json(response);
    }
}

const getDailyChallenges = {
    method: 'get',
    path: '/getDailyChallenges', 
    handler: async (req, res) => {
        const item = req.query.date;  
        const response = await handlers.getDailyChallenges(item);

        res.status(200).json(response);
    }
}

const seekCoaching = {
    method: 'post',
    path: '/seekCoaching', 
    handler: async (req, res) => {
        const question = req.body.question; 
        const user = req.body.user; 
        const sessionId = req.body.sessionId;        
        const response = await handlers.seekCoaching(user, question, sessionId);

        res.status(200).json(response);
    }
}

module.exports = { getUserInfoWithToken, setUserLoginInfo, getAllUsers, writeSelfCareEntryWithToken, getSelfCareStats, getPercentiles, getIndividualData, getActivities, getTeamList, getTeamStats, getSelfCareInsights, getTimeInputFromSpeech, writeRecommendation, getRecommendations, writeRecommendationComment, getRecommendationComments, writeReactionToComment, writeFeedback, sendInvite, getDailyChallenges, seekCoaching};