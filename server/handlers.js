const { BlobServiceClient } = require('@azure/storage-blob');
const MongoClient = require('mongodb');
const databaseId = process.env.MONGODB_DATABASE_ID;
const containerId = process.env.MONGODB_CONTAINER_ID;
const teamId = "team_info";
const recoId = "recommendations";
const userId = "userInfo";
const inviteId = "invite_info";
const ObjectId = require('mongodb').ObjectId;

let dbClient = null;
let team_container = null;
let recos_container = null;
let container = null;
let user_container = null;
let invite_container = null;

async function getMongoDbClient() {
  if (!dbClient) {
    const client = await new MongoClient(process.env.MONGODB_CONNECTION_STRING);
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
      
      // Check if the item with the same ID already exists in the database
      const existingItem = await ct.findOne({ _id: ObjectId(item._id) });
      
      if (existingItem) {
          // Item exists, perform an update
          item._id = ObjectId(item._id);
          const result = await ct.updateOne({ _id: item._id }, { $set: item });
          console.log('Item updated:', item._id);
      } else {
          // Item does not exist, perform an insert
          const result = await ct.insertOne(item);
          console.log('Item inserted:', result.insertedId);
      }
  } catch (err) {
      console.error('Error:', err);
  }
}

  

async function readEntries(itemId, startDay, endDay, category) {
  console.log(`Got called with id: ${itemId}`);
  if (category === undefined)  {
    category = "total";
  }
  console.log("Category is ", category);
  let include_mental = (category === "total" || category === "mental");
  let include_physical = (category === "total" || category === "physical");
  let include_social = (category === "total" || category === "social");
  let include_spiritual = (category === "total" || category === "spiritual");

  const ct = await getContainer();
  const result=await ct.aggregate([
    {
      $match: {
        name:itemId,
        DateTime: {
          $gte: new Date(startDay),
          $lte: new Date(endDay)
        }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$DateTime" } },
        total_health_time: {
          $sum: {
            $add: [
              {$cond: [include_mental,{ $toInt: "$mental_health_time" }, 0]},
              {$cond: [include_physical,{ $toInt: "$physical_health_time" }, 0]},
              {$cond: [include_spiritual,{ $toInt: "$spiritual_health_time" }, 0]},
              {$cond: [include_social,{ $toInt: "$societal_health_time" }, 0]},
            ]
          }
        },
        activities: {
          $push: {
            $concatArrays: [
              {
                $cond: {
                  if: {
                    $and: [
                      include_mental,
                      { $ne: ["$mental_health_activity", null] } // Check if mental_health_activity is not null
                    ]
                  },
                  then: [["$mental_health_activity", "$mental_health_time"]],
                  else: []
                }              
              },
              {
                $cond: {
                  if: {
                    $and: [
                      include_physical,
                      { $ne: ["$physical_health_activity", null] } // Check if mental_health_activity is not null
                    ]
                  },
                  then: [["$physical_health_activity", "$physical_health_time"]],
                  else: []
                }
              },
              {
                $cond: {
                  if: {
                    $and: [
                      include_spiritual,
                      { $ne: ["$spiritual_health_activity", null] } // Check if mental_health_activity is not null
                    ]
                  },
                  then: [["$spiritual_health_activity", "$spiritual_health_time"]],
                  else: []
                }
              },
              {
                $cond: {
                  if: {
                    $and: [
                      include_social,
                      { $ne: ["$societal_health_activity", null] } // Check if mental_health_activity is not null
                    ]
                  },
                  then: [["$societal_health_activity", "$societal_health_time"]],
                  else: []
                }
              }
            ]
          }
        }
      }
    },
    {
      $project: {
        total_health_time: 1,
        activities: {
          $reduce: {
            input: "$activities",
            initialValue: [],
            in: {
              $concatArrays: ["$$value", "$$this"]
            },              
          }        
        }
      }
    }
  ]).toArray();
  console.log(`Result is: ${result}`);
  const final = JSON.stringify(result);
  console.log(`Finale is ${final}`);
  return final;
}

async function readPercentile(percentile, startDay, endDay, category) {
  console.log(`Median called with percentile: ${percentile}`);
  percentile= parseInt(percentile);
  if (category === undefined)  {
    category = "total";
  }
  console.log("Category is ", category);
  let include_mental = (category === "total" || category === "mental");
  let include_physical = (category === "total" || category === "physical");
  let include_social = (category === "total" || category === "social");
  let include_spiritual = (category === "total" || category === "spiritual");
  
  const ct = await getContainer();
  const result= await ct.aggregate([
    {
      $match: {
        DateTime: {
          $gte: new Date(startDay),
          $lte: new Date(endDay)
        }
      }
    },
    {
      $group: {
        _id: {
          DateTime: { $dateToString: { format: "%Y-%m-%d", date: "$DateTime" } },
          Name: "$name"
        },
        total_health_time: {
          $sum: {
            $add: [
              {$cond: [include_mental,{ $toInt: "$mental_health_time" }, 0]},
              {$cond: [include_physical,{ $toInt: "$physical_health_time" }, 0]},
              {$cond: [include_spiritual,{ $toInt: "$spiritual_health_time" }, 0]},
              {$cond: [include_social,{ $toInt: "$societal_health_time" }, 0]},
            ]
          }
        },
        mental_care_activities: {
          $push: {
            $cond: {
              if: {
                $and: [
                  include_mental,
                  { $ne: ["$mental_health_activity", null] } // Check if mental_health_activity is not null
                ]
              },
              then: ["$mental_health_activity", "$mental_health_time"],
              else: []
            }  
          }
        },
        physical_care_activities: {
          $push: {
            $cond: {
              if: {
                $and: [
                  include_physical,
                  { $ne: ["$physical_health_activity", null] } // Check if mental_health_activity is not null
                ]
              },
              then: ["$physical_health_activity", "$physical_health_time"],
              else: []
            }
          }
        },
        spiritual_care_activities: {
          $push: {
            $cond: {
              if: {
                $and: [
                  include_spiritual,
                  { $ne: ["$spiritual_health_activity", null] } // Check if mental_health_activity is not null
                ]
              },
              then: ["$spiritual_health_activity", "$spiritual_health_time"],
              else: []
            }
          }
        },
        social_care_activities: {
          $push: {
            $cond: {
              if: {
                $and: [
                  include_social,
                  { $ne: ["$societal_health_activity", null] } // Check if mental_health_activity is not null
                ]
              },
              then: ["$societal_health_activity", "$societal_health_time"],
              else: []
            }
          }
        }      
      }
    },
    {
      $sort: { "_id.DateTime": 1, "total_health_time": 1 }
    },
    {
      $group: {
        _id: "$_id.DateTime",
        values: { $push: "$total_health_time" },
        activities: {
          $push: {
            total_health_time: "$total_health_time",
            self_care_activities: {
              $concatArrays: [
                "$mental_care_activities", 
                "$physical_care_activities", 
                "$spiritual_care_activities",
                "$social_care_activities", 
              ]          
            }
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        ptile: {
          $arrayElemAt: ["$values", { $floor: { $multiply: ["$count", percentile / 100] } }]
        },
        activities: 1  
      }
    },
    {
      $project: {
        ptile: "$ptile",
        activities: {
          $reduce: {
            input: "$activities",
            initialValue: [],
            in: {
              $cond: {
                if: { $lte: ["$$this.total_health_time", "$ptile"] },
                then: { $concatArrays: ["$$value", "$$this.self_care_activities"] },
                else: "$$value"
              }
            }
          }
        }
      }
    }  
  ]).toArray();
  const final = JSON.stringify(result);
  console.log(`Median itemss : ${final}`);
  return final;
}

async function readIndividualData(user, date) {
  console.log(`Get Individual Data request`);
  const ct = await getContainer();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0); // Set the time to midnight for the same day
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999); // Set the time to 11:59:59.999 PM for the same day

  const result = await ct.find({
    name: user,
    DateTime: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).toArray();
  console.log(`Individual Data is: ${result}`);
  const final = JSON.stringify(result);
  console.log(`Final individual data is ${final}`);
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
  const connectionString = process.env.AZURE_BLOB_CONNECTION_STRING;
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
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
  
module.exports = {getUserInfo, setUserLoginInfo, getAllUsers, writeEntry, readEntries, readPercentile, readIndividualData, readTeamList, readTeamStats, writeRecommendation, getRecommendations, writeFeedback, sendInvite};