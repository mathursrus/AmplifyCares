import './writetodb.js'
import {CosmosClient} from "@azure/cosmos";
import MongoClient from 'mongodb';

const databaseId = "amplifycares-db";
const containerId = "self_care_stats";
const teamId = "team_info";

const client = await new MongoClient("mongodb://amplifycares-server:iRIAx1TOBoMR0c035T1u6oB9DjEQUX0ySCwwyXF8G7CT02b92BbdYOGezGDn7Fv2JGKRdUWVxKnPACDb30unbw==@amplifycares-server.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@amplifycares-server@")
console.log(client)
const db = await client.db(databaseId);
console.log(db);
const container = await db.collection(containerId);
console.log(container);
const team_container = await db.collection(teamId);
console.log(team_container);


async function writeEntry(item) {
    try {
        console.log('Handler got item: ', item)
        const result = await container.insertOne(item);
        console.log('Item inserted now:', result.insertedId);
        //return result.insertedId;
      } catch (err) {
        console.error('Error:', err);
      }
  }
  

async function readEntries(itemId) {
  console.log(`Got called with id: ${itemId}`);
  const result=await container.aggregate([
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
  const result= await container.aggregate([
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
  const result=await container.aggregate([
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
  const result=await team_container.find().toArray();
  console.log(`Team list is: ${result}`);
  const final = JSON.stringify(result);
  console.log(`Final team list is ${final}`);
  return final;
}


async function readTeamStats(startDay, endDay) {
  console.log(`Get Team Stats request`);
  const result=await team_container.aggregate([
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
  const result= await container.aggregate([{$match:{name:"$itemId"}}, 
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

  async function updateItem(itemId, item) {
    item.id = itemId;
    const { resource: updatedItem } = await container.item(itemId, itemId).replace(item);
    console.log(`Updated item with id: ${updatedItem.id}`);
  }
  
  async function deleteItem(itemId) {
    const { resource: deletedItem } = await container.item(itemId, itemId).delete();
    console.log(`Deleted item with id: ${deletedItem.id}`);
  }
  
  export {writeEntry, readEntries, readPercentile, readIndividualStats, readTeamList, readTeamStats};