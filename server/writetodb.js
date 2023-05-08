import './routes.js';
import './handlers.js'
import express from 'express';
import {writeSelfCareEntry, getSelfCareStats, getPercentiles, getTeamStats, getIndividualStats, getTeamList} from './routes.js';
import cors from 'cors';

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({origin:"*"}));
app[writeSelfCareEntry.method](writeSelfCareEntry.path, writeSelfCareEntry.handler);
app[getSelfCareStats.method](getSelfCareStats.path, getSelfCareStats.handler);
app[getPercentiles.method](getPercentiles.path, getPercentiles.handler);
app[getIndividualStats.method](getIndividualStats.path, getIndividualStats.handler);
app[getTeamList.method](getTeamList.path, getTeamList.handler);
app[getTeamStats.method](getTeamStats.path, getTeamStats.handler);

try {
  app.listen(8080, () => {console.log(`Server is running on port 8080`)});
}
catch (err) {
  console.error(err.stack);
}

