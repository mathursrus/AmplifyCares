var mongoClient = require("mongodb").MongoClient;
mongoClient.connect("mongodb://amplifycares-server:iRIAx1TOBoMR0c035T1u6oB9DjEQUX0ySCwwyXF8G7CT02b92BbdYOGezGDn7Fv2JGKRdUWVxKnPACDb30unbw%3D%3D@amplifycares-server.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@amplifycares-server@", function (err, client) {
  client.close();
});