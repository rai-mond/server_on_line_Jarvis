const http = require('http');
const https = require('https');
const compression = require('compression');

const express = require("express");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");


const path = require('path');
var easyrtc = require("open-easyrtc");      // EasyRTC external module

var socketIo = require("socket.io"); 


const app = express();

// set port, listen for requests
const PORT = process.env.PORT || 8080;

process.title = "node-easyrtc";

const isHttps = false; // must be the same on client.js
let io, server, host;

// directory
const dir = {
  public: path.join(__dirname,  'app/static'),
};
// html views
/*
const indirizzi = {
  about: path.join(__dirname, '../../', 'public/views/about.html'),
  landing: path.join(__dirname, 'app/static/landing.html'),
  newCall: path.join(__dirname, '../../', 'static/landing.html'),
  notFound: path.join(__dirname, '../../', 'public/views/404.html'),
  permission: path.join(__dirname, '../../', 'public/views/permission.html'),
  privacy: path.join(__dirname, '../../', 'public/views/privacy.html'),
  stunTurn: path.join(__dirname, '../../', 'public/views/testStunTurn.html'),
};
*/


var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

app.use(compression()); // Compress all HTTP responses using GZip


// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));



app.use(express.static(dir.public)); // Use all static files from the public folder


if (isHttps) {
  const fs = require('fs');
  const options = {
      key: fs.readFileSync(path.join(__dirname, '../ssl/key.pem'), 'utf-8'),
      cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.pem'), 'utf-8'),
  };
  server = https.createServer(options, app);
  host = 'https://' + 'localhost' + ':' + PORT;
} else {
  server = http.createServer(app);
  host = 'http://' + 'localhost' + ':' + PORT;
}

var socketServer = socketIo.listen(server, {"log level":1});

easyrtc.setOption("logLevel", "debug");

// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on("easyrtcAuth", function(socket, easyrtcid, msg, socketCallback, callback) {
  easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function(err, connectionObj){
      if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
          callback(err, connectionObj);
          return;
      }

      connectionObj.setField("credential", msg.msgData.credential, {"isShared":false});

      console.log("["+easyrtcid+"] Credential saved!", connectionObj.getFieldValueSync("credential"));

      callback(err, connectionObj);
  });
});

// To test, lets print the credential to the console for every room join!
easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParameter, callback) {
  console.log("["+connectionObj.getEasyrtcid()+"] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
  easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
});

// Start EasyRTC server
var rtc = easyrtc.listen(app, socketServer, null, function(err, rtcRef) {
  console.log("Initiated");

  rtcRef.events.on("roomCreate", function(appObj, creatorConnectionObj, roomName, roomOptions, callback) {
      console.log("roomCreate fired! Trying to create: " + roomName);

      appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
  });
});



const db = require("./app/models");
const Role = db.role;
const Data = db.data;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Jarvis server application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "installator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'installator' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
  Data.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Data({
        inst: {"user":{data:"il_file_JSON"}}
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'data' to data collection");
      });

    }
  })
}
