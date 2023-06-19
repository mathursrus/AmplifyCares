const handlers = require('./handlers');

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

const getSelfCareStats = {
    method: 'get',
    path: '/getselfcarestats',
    handler: async (req, res) => {
        console.log("Got req: ", req.query);
        const item = await req.query.item;  
        console.log("Got item: ", item);      
        const response = await handlers.readEntries(item);
        res.status(200).json(response);
    }
}

const getPercentiles = {
    method: 'get',
    path: '/getpercentiles',
    handler: async (req, res) => {
        console.log("Got perc req: ", req.query);
        const item = await req.query.item;  
        console.log("Got perc item: ", item);      
        const response = await handlers.readPercentile(item);
        res.status(200).json(response);
    }
}

const getIndividualStats = {
    method: 'get',
    path: '/getindividualstats',
    handler: async (req, res) => {
        console.log("Got individual stats req: ", req.query);
        const response = await handlers.readIndividualStats();
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
        console.log("Got team stats req: ", req.query, ", with startDay: ", urlParams.get('startDay'), ", endDay: ", urlParams.get('endDay'));
        const response = await handlers.readTeamStats(parseInt(urlParams.get('startDay')), parseInt(urlParams.get('endDay')));

        res.status(200).json(response);
    }
}

const writeRecommendation = {
    method: 'get',
    path: '/writerecommendation', 
    handler: async (req, res) => {
        console.log("Writing Recommendation: ", req.query);
        const item = await req.query.item;        
        const response = await handlers.writeRecommendation(JSON.parse(item));
        res.status(200).json(response);
    }
}

const getRecommendations = {
    method: 'get',
    path: '/getRecommendations', 
    handler: async (req, res) => {
        const item = parseInt(await req.query.item);  
        console.log("Got reco item: ", item);      
        const response = await handlers.getRecommendations(item);

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

module.exports = { writeSelfCareEntry, getSelfCareStats, getPercentiles, getIndividualStats, getTeamList, getTeamStats, writeRecommendation, getRecommendations, writeFeedback};