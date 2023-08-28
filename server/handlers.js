const { BlobServiceClient } = require('@azure/storage-blob');
const MongoClient = require('mongodb');
const databaseId = "amplifycares-db-catita";
const containerId = "self_care_stats";
const teamId = "team_info";
const recoId = "recommendations";
const userId = "userInfo";
const inviteId = "invite_info";

let dbClient = null;
let team_container = null;
let recos_container = null;
let container = null;
let user_container = null;
let invite_container = null;

async function getMongoDbClient() {
  if (!dbClient) {
    const client = await new MongoClient("mongodb://amplifycares-server:iRIAx1TOBoMR0c035T1u6oB9DjEQUX0ySCwwyXF8G7CT02b92BbdYOGezGDn7Fv2JGKRdUWVxKnPACDb30unbw==@amplifycares-server.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@amplifycares-server@")
    console.log(client)
    dbClient = await client.db(databaseId);
    console.log('db client:', dbClient);
  }
  return dbClient;
}

async function getContainer() {
  if (!container) {
    var cl = await getMongoDbClient();
    container = await cl.collection(containerId);
  }
  return container;
}

async function getTeamContainer() {
  if (!team_container) {
    var cl = await getMongoDbClient();
    team_container = await cl.collection(teamId);
  }
  return team_container;
}

async function getRecommendationsContainer() {
  if (!recos_container) {
    var cl = await getMongoDbClient();
    recos_container = await cl.collection(recoId);
  }
  return recos_container;
}

async function getUserContainer() {
  if (!user_container) {
    var cl = await getMongoDbClient();
    user_container = await cl.collection(userId);
    console.log(user_container);
  }
  return user_container;
}

async function getInviteContainer() {
  if (!invite_container) {
    var cl = await getMongoDbClient();
    invite_container = await cl.collection(inviteId);
    console.log(invite_container);
  }
  return invite_container;
}

async function getUserInfo(user) {
  try {
      console.log('Get UserInfo handler got user: ', user)
      const ct = await getUserContainer();
      const result=await ct.find({username:user}).toArray();
      console.log(`Result is: ${result}`);
      const final = JSON.stringify(result);
      console.log(`Finale is ${final}`);
      return final;
    } catch (err) {
      console.error('Error:', err);
    }
}

async function setUserLoginInfo(user, loginTime) {
  try {
      console.log('Set UserInfo handler got user: ', user)
      const ct = await getUserContainer();
      const result=await ct.findOneAndUpdate(
        { username: user },
        { $set: { lastLoginTime: loginTime } },
        { upsert: true });
      console.log(`Login info set, result is: ${result}`);            
    } catch (err) {
      console.error('Error:', err);
    }
}

async function getAllUsers(domain) {
  try {
    console.log('Get all users handler called');
    const ct = await getUserContainer();

    // Use projection to retrieve only the 'username' field
    // and filter documents with 'username' matching the given domain
    const result = await ct.find(
      { username: { $regex: domain, $options: 'i' } },
      { projection: { username: 1 } }
    ).toArray();

    console.log('Result:', result);
    const final = JSON.stringify(result);
    console.log('Final:', final);
    return final;
  } catch (err) {
    console.error('Error:', err);
  }
}


async function writeEntry(item) {
    try {
        console.log('Handler got item: ', item)
        item.DateTime = new Date(item.DateTime);
        const ct = await getContainer();
        const result = await ct.insertOne(item);
        console.log('Item inserted now:', result.insertedId);
        //return result.insertedId;
      } catch (err) {
        console.error('Error:', err);
      }
  }
  

async function readEntries(itemId) {
  console.log(`Got called with id: ${itemId}`);
  const ct = await getContainer();
  const result=await ct.aggregate([
    {
      $match: {
        name:itemId
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$DateTime" } },
        total_health_time: {
          $sum: {
              $add: [
              { $toInt: "$mental_health_time" },
              { $toInt: "$physical_health_time" },
              { $toInt: "$spiritual_health_time" },
              { $toInt: "$societal_health_time" }
              ]
          }
        }
      }
    },
  ]).toArray();
  console.log(`Result is: ${result}`);
  const final = JSON.stringify(result);
  console.log(`Finale is ${final}`);
  return final;
}

async function readPercentile(percentile) {
  console.log(`Median called with percentile: ${percentile}`);
  percentile= parseInt(percentile);
  const ct = await getContainer();
  const result= await ct.aggregate([
    {
      $group: {
        _id: {
          DateTime: { $dateToString: { format: "%Y-%m-%d", date: "$DateTime" } },
          Name: "$name"
        },
        total_health_time: {
          $sum: {
              $add: [
              { $toInt: "$mental_health_time" },
              { $toInt: "$physical_health_time" },
              { $toInt: "$spiritual_health_time" },
              { $toInt: "$societal_health_time" }
              ]
          }
        }
      }
    },
    {
      $sort: {"_id.DateTime":1, "total_health_time": 1 }
    },
    {
      $group: {
        _id: "$_id.DateTime",
        values: { $push: "$total_health_time" },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        ptile: {
          $arrayElemAt: ["$values", {$floor: {$multiply: ["$count", percentile/100]}}]
        }
      }
    },
  ]).toArray();
  const final = JSON.stringify(result);
  console.log(`Median itemss : ${final}`);
  return final;
}

async function readIndividualStats() {
  console.log(`Get Individual Stats request`);
  const ct = await getContainer();
  const result=await ct.aggregate([
    {
      $group: {
        _id: {Name:"$name"},
        total_health_time: {
          $sum: {
              $add: [
              { $toInt: "$mental_health_time" },
              { $toInt: "$physical_health_time" },
              { $toInt: "$spiritual_health_time" },
              { $toInt: "$societal_health_time" }
              ]
          }
        }
      }
    },
    {
      $sort: {"total_health_time": -1 }
    }
  ]).toArray();
  console.log(`Individual Stats are: ${result}`);
  const final = JSON.stringify(result);
  console.log(`Final individual stats are ${final}`);
  return final;
}

async function readTeamList() {
  console.log(`Get team list got called`);
  const tct = await getTeamContainer();
  const result=await tct.find().toArray();
  console.log(`Team list is: ${result}`);
  const final = JSON.stringify(result);
  console.log(`Final team list is ${final}`);
  return final;
}


async function readTeamStats(startDay, endDay) {
  console.log(`Get Team Stats request start `, startDay, ":", endDay);
  const tct = await getTeamContainer();
  const numberOfDays = Math.floor((new Date(endDay).getTime() - new Date(startDay).getTime()) / (1000 * 60 * 60 * 24))+1;
  console.log("Number of days ", numberOfDays);

  const result=await tct.aggregate([
    {
      $match: {
        "team_members": { $exists: true, $not: {$size: 0} }
      }
    },
    {
      $lookup: {
        from: "self_care_stats",
        localField: "team_members.member_id",
        foreignField: "name",
        as: "team_members"
      }
    },
    {
      $unwind: "$team_members"
    },
    {
      $match: {
        "team_members.DateTime": {
          $gte: new Date(startDay),
          $lte: new Date(endDay)
        }
      }
    },
    {
      $group: {
        _id: {
          team_name: "$team_name",
          team_member_name: "$team_members.name"
        },
        total_time: {
          $sum: {
            $add: [
              "$team_members.mental_health_time",
              "$team_members.physical_health_time",
              "$team_members.spiritual_health_time",
              "$team_members.societal_health_time"
            ]
          }
        }
      }
    },
    {
      $sort: { "team_name":1, "total_time": -1 }
    },
    {
      $group: {
        _id: "$_id.team_name",
        times: { $push: "$total_time" }
      }
    },
    {
      $project: {
        _id: 1,
        times: 1,
        count: { $size: "$times" }
      }
    },
    {
      $project: {
        median: {
          $cond: [
            { $eq: [{ $mod: [ "$count", 2 ] }, 0 ] },
            { $avg: [{ $slice: ["$times", { $subtract: [ { $divide: ["$count", 2] }, 1 ]}, 2] }] },
            { $arrayElemAt: [ "$times", { $divide: [ { $subtract: [ "$count", 1 ] }, 2 ] } ] }
          ]
        }
      }
    },
    {
      $project: {
        _id: 1,
        median: {
          $ceil: { $divide: ["$median", numberOfDays] }
        }
      }
    },
     {
      $sort: { "median": -1 }
    }
  ]).toArray();
  console.log(`Team Stats are: ${result}`);
  const final = JSON.stringify(result);
  console.log(`Final team stats are ${final}`);
  return final;
}

async function readHighBar(itemId) {
  console.log(`Got called with id: ${itemId}`);
  //const { resource: item } = await container.item(itemId, itemId).read();
  const ct = await getContainer();
  const result= await ct.aggregate([{$match:{name:"$itemId"}}, 
    {$group: {_id:"$name", 
      total_mental_health: {$sum:{$add:[{$toInt: "$mental_health_time"}]}},
      total_physical_health: {$sum:{$add:[{$toInt: "$physical_health_time"}]}},
      total_spiritual_health: {$sum:{$add:[{$toInt: "$spiritual_health_time"}]}},
      total_societal_health: {$sum:{$add:[{$toInt: "$societal_health_time"}]}},
    }}]).toArray();
  const final = JSON.stringify(result);
  console.log(`Read itemss : ${final}`);
  return final;
}

async function writeRecommendation(item) {
  try {
      console.log('Handler got item: ', item)
      const ct = await getRecommendationsContainer();
      const result = await ct.insertOne(item);
      console.log('Item inserted now:', result.insertedId);
      //return result.insertedId;
    } catch (err) {
      console.error('Error:', err);
    }
}


async function getRecommendations(itemId) {
  console.log(`Got called with id: ${itemId}`);
  const ct = await getRecommendationsContainer();
  console.log(`Got container: ${ct}`);
  const result=await ct.find({type:itemId}).toArray();
  console.log(`Result is: ${result}`);
  const final = JSON.stringify(result);
  console.log(`Finale is ${final}`);
  return final;
}

async function writeFeedback(feedback) {
  const connectionString = 'DefaultEndpointsProtocol=https;AccountName=videofeedback;AccountKey=6t8Yt+nzMkliEjDkczVXsRQPbgQwlMh0LfAOyPZn/AexG2AJELAkCWc0JFmFn4ZpZxxOVILiiWDk+ASt+J0hYQ==;EndpointSuffix=core.windows.net';
  const containerName = 'mp4';

  // Create a BlobServiceClient object using the connection string
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

  // Get a reference to a container
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Create a unique blob name
  const blobName = `${Date.now()}-feedback.mp4`;

  const buffer = Buffer.from(feedback, 'base64');
  await containerClient.uploadBlockBlob(blobName, buffer, buffer.length);

  console.log("URL is ", containerClient.getBlockBlobClient(blobName).url);
  return containerClient.getBlockBlobClient(blobName).url.toString();
}

async function sendInvite(inviteText) {
  try {
    console.log('Handler got invite: ', inviteText);
    const invite = {
      datetime: new Date(),
      invite: inviteText
    };
    const ct = await getInviteContainer();
    const result = await ct.insertOne(invite);
    console.log('Invite inserted now:', result.insertedId);
    //return result.insertedId;
  } catch (err) {
    console.error('Error:', err);
  }
}

async function sendmail() {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey('your_sendgrid_api_key');

  const ct = await getUserContainer();
  const reipients = await ct.find().toArray();
  recipients[0].username;

  const msg = {
    to: 'recipient@example.com',
    from: 'sender@example.com',
    subject: 'New Features Announcement',
    text: 'Check out our latest features...',
    html: '<p>Check out our <strong>latest features</strong>...</p>',
  };

  sgMail.send(msg);
}
  
  async function deleteItem(itemId) {
    const ct = await getContainer();
    const { resource: deletedItem } = await ct.item(itemId, itemId).delete();
    console.log(`Deleted item with id: ${deletedItem.id}`);
  }
  
module.exports = {getUserInfo, setUserLoginInfo, getAllUsers, writeEntry, readEntries, readPercentile, readIndividualStats, readTeamList, readTeamStats, writeRecommendation, getRecommendations, writeFeedback, sendInvite};