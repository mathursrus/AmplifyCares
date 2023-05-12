import './writetodb.js'
import './handlers.js'
import {writeEntry, readEntries, readPercentile, readTeamStats, readIndividualStats, readTeamList} from './handlers.js';

const writeSelfCareEntry = {
    method: 'get',
    path: '/writeselfcare',
    handler: async (req, res) => {
        console.log("Got req: ", req.query);
        const item = await req.query.item;        
        const response = await writeEntry(JSON.parse(item));
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
        const response = await readEntries(item);
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
        const response = await readPercentile(item);
        res.status(200).json(response);
    }
}

const getIndividualStats = {
    method: 'get',
    path: '/getindividualstats',
    handler: async (req, res) => {
        console.log("Got individual stats req: ", req.query);
        const response = await readIndividualStats();
        res.status(200).json(response);
    }
}

const getTeamList = {
    method: 'get',
    path: '/getteamlist',
    handler: async (req, res) => {
        console.log("Got team list req: ", req.query);
        const response = await readTeamList();
        res.status(200).json(response);
    }
}

const getTeamStats = {
    method: 'get',
    path: '/getteamstats/startDay/:startDay/endDay/:endDay',
    handler: async (req, res) => {
        console.log("Got team stats req: ", req.query);
        const response = await readTeamStats(Number(req.params.startDay), Number(req.params.endDay));
        res.status(200).json(response);
    }
}

export {writeSelfCareEntry, getSelfCareStats, getPercentiles, getIndividualStats, getTeamList, getTeamStats};