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
        console.log("Got team stats req: ", req.query, ", with startDay: ", req.query.startDay);
        const response = await handlers.readTeamStats(req.query.startDay, req.query.endDay);

        res.status(200).json(response);
    }
}

module.exports = { writeSelfCareEntry, getSelfCareStats, getPercentiles, getIndividualStats, getTeamList, getTeamStats};