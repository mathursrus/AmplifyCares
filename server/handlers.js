const { BlobServiceClient } = require('@azure/storage-blob');
const FormData = require('form-data');
const MongoClient = require('mongodb');
const databaseId = process.env.MONGODB_DATABASE_ID;
const containerId = process.env.MONGODB_CONTAINER_ID;
const teamId = "team_info";
const recoId = "recommendations";
const userId = "userInfo";
const inviteId = "invite_info";
const ObjectId = require('mongodb').ObjectId;
const axios  = require('axios');
//const nlp = require('compromise');

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

async function getUserInfoWithToken(token) {
  try {
      console.log("Success: ", token);
      // Split the token into header, payload, and signature
      const [headerB64, payloadB64] = token.split('.');

      // Decode the base64-encoded header and payload
      const header = JSON.parse(atob(headerB64));
      const payload = JSON.parse(atob(payloadB64));

      console.log('Decoded Header:', header);
      console.log('Decoded Payload:', payload);
      const user = payload.upn;
      
      return getUserInfo(user);
  } catch (err) {
      console.error('Error:', err);
  }
}

async function getUserInfo(user) {
  try {
      console.log('Get UserInfo handler got user: ', user)
      const ct = await getUserContainer();
      // Lookup and join the user with recommendations where the user is a participant
      const pipeline = [
        {
          $match: { username: user }, // Filter by user
        },
        {
          $lookup: {
            from: 'recommendations', // Replace with your actual collection name
            localField: 'username',
            foreignField: 'participants',
            as: 'circles',
          },
        },
      ];

      const result = await ct.aggregate(pipeline).toArray();

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

/*
function lemmatizeActivities(activityArray) {
  const resultArray = [];
  if (activityArray) {
    activityArray.forEach((activity) => {
      const doc = nlp(activity);
      const lemmatizedVerbs = doc
        .match('#Verb')
        .toInfinitive()
        .out('array');
      
      const lemmatizedResult = lemmatizedVerbs.join(' ');
      resultArray.push(lemmatizedResult);
    });    
  }
  return resultArray;
}*/

async function writeEntryWithToken(item, token) {
  try {
      // Split the token into header, payload, and signature
      const [headerB64, payloadB64] = token.split('.');

      // Decode the base64-encoded header and payload
      const header = JSON.parse(atob(headerB64));
      const payload = JSON.parse(atob(payloadB64));

      const user = payload.upn;
      if (user !== item.name) throw Error("UPN is " + user + ", entry is for " + item.name);
      
      return writeEntry(item);
  } catch (err) {
      console.error('Error:', err);
  }
}

async function writeEntry(item) {
  try {
      console.log('Handler got item: ', item)
      item.DateTime = new Date(item.DateTime);
      item.DateTime.setUTCHours(0, 0, 0, 0);      
      const ct = await getContainer();
      
      // Check if the item with the same ID already exists in the database
      const existingItem = await ct.findOne({ _id: ObjectId(item._id) });
      const isEmptyItem =
        ((item.mental_health_time || 0) === 0) &&
        ((item.physical_health_time || 0) === 0) &&
        ((item.spiritual_health_time || 0) === 0) &&
        ((item.societal_health_time || 0) === 0);


      // if not an empty item, lemmatize the activities
      /*if (!isEmptyItem) {
        item.mental_health_activity = lemmatizeActivities(item.mental_health_activity);
        item.physical_health_activity = lemmatizeActivities(item.physical_health_activity);
        item.spiritual_health_activity = lemmatizeActivities(item.spiritual_health_activity);
        item.societal_health_activity = lemmatizeActivities(item.societal_health_activity);
      }*/

      var result = item;
      if (existingItem) {
          item._id = ObjectId(item._id);            
          if (isEmptyItem) {
            // if all entries are 0, then delete
            ct.deleteOne({ _id: item._id });
            console.log('Item deleted:', item._id);
          }
          else {
            // Item exists, perform an update
            await ct.updateOne({ _id: item._id }, { $set: item });
            console.log('Item updated:', item._id);
          }
      } else {
        if (!isEmptyItem) {
            // Item does not exist, perform an insert
            await ct.insertOne(item);
            console.log('Item inserted:', result.insertedId);
        }
        else {
          // nothing done since its a new empty item
          result = null;
        }
      }
      return result;
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

  let startDate=new Date(startDay);
  startDate.setUTCHours(0, 0, 0, 0);
  let endDate=new Date(endDay);
  endDate.setUTCHours(23, 59, 59, 999);

  const ct = await getContainer();
  const result=await ct.aggregate([
    {
      $match: {
        name:itemId,
        DateTime: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$DateTime" } },
        total_health_time: {
          $sum: {
            $add: [
              {
                $cond: [include_mental, { $toInt: { $ifNull: ["$mental_health_time", 0] } }, 0]
              },
              {
                $cond: [include_physical, { $toInt: { $ifNull: ["$physical_health_time", 0] } }, 0]
              },
              {
                $cond: [include_spiritual, { $toInt: { $ifNull: ["$spiritual_health_time", 0] } }, 0]
              },
              {
                $cond: [include_social, { $toInt: { $ifNull: ["$societal_health_time", 0] } }, 0]
              }
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
                      { $ne: [
                        { $ifNull: ["$mental_health_activity", null] },
                        null
                      ] } // Check if mental_health_activity is not null
                    ]
                  },
                  then: [["$mental_health_activity", { $ifNull: ["$mental_health_time", 0] }]],
                  else: []
                }
              },
              {
                $cond: {
                  if: {
                    $and: [
                      include_physical,
                      { $ne: [
                        { $ifNull: ["$physical_health_activity", null] },
                        null
                      ] } // Check if physical_health_activity is not null
                    ]
                  },
                  then: [["$physical_health_activity", { $ifNull: ["$physical_health_time", 0] }]],
                  else: []
                }
              },
              {
                $cond: {
                  if: {
                    $and: [
                      include_spiritual,
                      { $ne: [
                        { $ifNull: ["$spiritual_health_activity", null] },
                        null
                      ] } // Check if spiritual_health_activity is not null
                    ]
                  },
                  then: [["$spiritual_health_activity", { $ifNull: ["$spiritual_health_time", 0] }]],
                  else: []
                }
              },
              {
                $cond: {
                  if: {
                    $and: [
                      include_social,
                      { $ne: [
                        { $ifNull: ["$societal_health_activity", null] },
                        null
                      ] } // Check if societal_health_activity is not null
                    ]
                  },
                  then: [["$societal_health_activity", { $ifNull: ["$societal_health_time", 0] }]],
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
  
  let startDate=new Date(startDay);
  startDate.setUTCHours(0, 0, 0, 0);
  let endDate=new Date(endDay);
  endDate.setUTCHours(23, 59, 59, 999);

  const ct = await getContainer();
  const result= await ct.aggregate([
    {
      $match: {
        DateTime: {
          $gte: startDate,
          $lte: endDate
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
              {
                $cond: [include_mental, { $toInt: { $ifNull: ["$mental_health_time", 0] } }, 0]
              },
              {
                $cond: [include_physical, { $toInt: { $ifNull: ["$physical_health_time", 0] } }, 0]
              },
              {
                $cond: [include_spiritual, { $toInt: { $ifNull: ["$spiritual_health_time", 0] } }, 0]
              },
              {
                $cond: [include_social, { $toInt: { $ifNull: ["$societal_health_time", 0] } }, 0]
              }
            ]
          }
        },
        mental_care_activities: {
          $push: {
            $cond: {
              if: {
                $and: [
                  include_mental, 
                  { $ne: [
                    { $ifNull: ["$mental_health_activity", null] },
                    null
                  ] }, // Check if mental_health_activity is not null
                ]},
              then: ["$mental_health_activity", { $ifNull: ["$mental_health_time", 0] }],  
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
                  { $ne: [
                    { $ifNull: ["$physical_health_activity", null] },
                    null
                  ] }, // Check if physical_health_activity is not null
                ]},
              then: ["$physical_health_activity", { $ifNull: ["$physical_health_time", 0] }],            
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
                  { $ne: [
                    { $ifNull: ["$spiritual_health_activity", null] },
                    null
                  ] }, // Check if spiritual_health_activity is not null
                ]},
              then: ["$spiritual_health_activity", { $ifNull: ["$spiritual_health_time", 0] }],
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
                  { $ne: [
                    { $ifNull: ["$societal_health_activity", null] },
                    null
                  ] }, // Check if social_health_activity is not null
                ]},
              then: ["$societal_health_activity", { $ifNull: ["$societal_health_time", 0] }],
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
  startOfDay.setUTCHours(0, 0, 0, 0); // Set the time to midnight for the same day
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999); // Set the time to 11:59:59.999 PM for the same day

  console.log("Start ", startOfDay, ", End ", endOfDay);

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

  let startDate=new Date(startDay);
  startDate.setUTCHours(0, 0, 0, 0);
  let endDate=new Date(endDay);
  endDate.setUTCHours(23, 59, 59, 999);

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
          $gte: startDate,
          $lte: endDate
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
              { $toInt: { $ifNull: ["$team_members.mental_health_time", 0] } },
              { $toInt: { $ifNull: ["$team_members.physical_health_time", 0] } },
              { $toInt: { $ifNull: ["$team_members.spiritual_health_time", 0] } },
              { $toInt: { $ifNull: ["$team_members.societal_health_time", 0] } },                                          
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

async function getSelfCareInsights(username, startDay, endDay, questions) {
  console.log(`Self Care Insights request ${username}, ${startDay}, ${endDay}, ${questions}`);
  const answers = [];
  const promises = [];
      
  if (questions.length > 0) {
    const ct = await getContainer();
    const start = new Date(startDay);
    start.setUTCHours(0, 0, 0, 0); // Set the time to midnight for the same day
    const end = new Date(endDay);
    end.setUTCHours(23, 59, 59, 999); // Set the time to 11:59:59.999 PM for the same day

    const allData = await ct.find({
      name: username,
      DateTime: {
        $gte: start,
        $lte: end
      }
    }).toArray();

    const uniqueDays = new Set();
    allData.forEach((data) => {
      const dataDate = new Date(data.DateTime.toISOString().split('T')[0]); // Extract the date portion
      uniqueDays.add(dataDate.toISOString()); // Store the unique day as a string to ensure uniqueness
    });
    if (uniqueDays.size >= 14) {
      // Remove _id and lastEdited fields from each object in allData
      const cleanedData = allData.map(({ _id, lastEdited, ...rest }) => rest);

      try {          
        // convert this into a GPT prompt
        const promptBase = "Here is a set of self-care data. Process this data and then the user will ask you a question about it. \
        Address the user like you are talking to them. \
        Even if the user asks multiple questions, keep your answer brief with a maximum of 3 key points. \
        Be helpful in your responses. Be specific and perform math on numbers from the provided data, if needed. \
        The users name is " + username +". Their data over the last 60 days is: ";

        const prompt = promptBase + JSON.stringify(cleanedData);

        questions.forEach((question) => {
          const answerPromise = callOpenAICompletions(prompt, question);
          promises.push(answerPromise);          
        });

        // Wait for all answer promises to resolve
        const resolvedAnswers = await Promise.all(promises);
        answers.push(...resolvedAnswers);
      } catch (error) {
        console.log("CallOpenAICompletions returned error: ");
      }
    } else {
      questions.forEach((question) => {
        answers.push("Thank you for your interest in self care. I need at least 14 days of self care data over a 60 day time period to provide insights. Please add data in the Submit page of the app");
      });  
    }
  } else  {
    console.log("Got no questions");
  }

  console.log("Returning ", answers);
  return JSON.stringify(answers);
}


async function getTimeInputFromSpeech(username, item, timezone) {
  const audioBuffer = Buffer.from(item, 'base64');
  const formData = new FormData(); 
  formData.append('file', audioBuffer, {
    contentType: 'audio/wav', 
    filename: 'audio.wav', 
  });
  formData.append('model', 'whisper-1');
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData.getBuffer(), 
      {
        headers: {
          Authorization: `Bearer ${process.env.OPEN_AI_KEY}`, 
          ...formData.getHeaders(),          
        },
      }
    );
    const result = response.data.text;
    console.log("Speech to text is ", response.data.text);
      
    const today = new Date().toLocaleDateString('en-US', { timeZone: timezone });
    const prompt = "Please format the following input into the specified format: {date in mm/dd/yyyy format, category, time spent in minutes, activity performed}. \
    Categories should be one of Mental Health, Physical Health, Spiritual Health, Social Health.\
    The user can use references like yesterday, last Saturday. You should convert them to dates in the " + timezone + " time zone. If no date is referenced, assume the date is today's date. \
    Today is " + today + ". Activity performed should be a single word capturing the action verb. \
    Input: On 20th September 2023, I practiced mindfulness meditation for 20 minutes and went for a 25-minute jog.\
    Output: {09/20/2023, Mental Health, 20, mindfulness meditation}, {09/20/2023, Physical Health, 25, jog}."

    const openairesult = await callOpenAICompletions(prompt, result);
    console.log("OpenAI result is ", openairesult);

    const final = await convertOpenAIToTimeEntries(username, openairesult);
    console.log("Final entries are result is ", final);

    return JSON.stringify(final);
  }
  catch (error) {
    if (error.response) {
      // The request was made, but the server responded with an error status code
      console.error('OpenAI Error:', error.response.data.error.message);
    } else if (error.request) {
      // The request was made, but no response was received
      console.error('No response received from OpenAI');
    } else {
      // Something else happened while setting up the request
      console.error('Axios Error:', error.message);
    }
  }
}

async function callOpenAICompletions(prompt, text) {
  try {    
    console.log("Prompt ", prompt);
    
    const conversation = [
      { role: 'system', content: prompt }
    ];

    const userMessage = { role: 'user', content: `Input: ${text}. Output: `};
    conversation.push(userMessage);

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: conversation,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const completedText = response.data.choices[0].message.content;
    console.log('OpenAI Completions Result:', completedText);    

    return completedText;
  } catch (error) {
    console.error('Error calling OpenAI Completions:', error.message);
    throw error;
  }
}

async function convertOpenAIToTimeEntries(username, inputString) {  
  // Split the input string into individual entries
  const entries = inputString.split("},");

  // Create a function to parse date strings into Date objects
  function parseDate(dateString) {
    const [month, day, year] = dateString.split("/");
    const date = new Date(year, month - 1, day);
    date.setUTCHours(0, 0, 0, 0)
    return date;
  }
  
  const promises = [];

  // Iterate through each entry
  entries.forEach(async (entry) => {
    // Remove curly braces and split the entry into components
    const components = entry.replace(/{|}/g, "").split(", ");

    // Extract individual components
    const date = parseDate(components[0]);
    const category = components[1];
    const timeCheck = parseInt(components[2]);
    const time = (isNaN(timeCheck) || timeCheck < 0)?0:timeCheck;
    const activity = components[3];

    if (["Mental Health", "Physical Health", "Spiritual Health", "Social Health"].includes(category))  {
      // Create an object in the desired format
      const itemData = {
        name: username,
        DateTime: date,
        lastEdited: new Date(),
      };

      if (category === "Mental Health") {
        itemData.mental_health_time = time;
        itemData.mental_health_activity = [activity];
      }

      if (category === "Physical Health") {
        itemData.physical_health_time = time;
        itemData.physical_health_activity = [activity];
      }

      if (category === "Spiritual Health") {
        itemData.spiritual_health_time = time;
        itemData.spiritual_health_activity = [activity];
      }

      if (category === "Social Health") {
        itemData.societal_health_time = time;
        itemData.societal_health_activity = [activity];
      }

      promises.push(writeEntry(itemData));            
    }
  });

  const results = await Promise.all(promises);
  
  console.log(results);    
  return results;    
}

async function writeRecommendation(item) {
  try {
      console.log('Handler got item: ', item)
      const ct = await getRecommendationsContainer();
      const existingItem = await ct.findOne({ _id: ObjectId(item._id) });
      if (existingItem) {
        item._id = ObjectId(item._id);            
        // Item exists, perform an update
        await ct.updateOne({ _id: item._id }, { $set: item });
        console.log('Recommendation updated:', item._id);        
      } else {        
        result = await ct.insertOne(item);
        console.log('Recommendation inserted');
      }            
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
  
module.exports = {getUserInfo, getUserInfoWithToken, setUserLoginInfo, getAllUsers, writeEntry, writeEntryWithToken, readEntries, readPercentile, readIndividualData, readTeamList, readTeamStats, getSelfCareInsights, getTimeInputFromSpeech, writeRecommendation, getRecommendations, writeFeedback, sendInvite};