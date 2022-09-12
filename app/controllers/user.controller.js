var express = require('express')
const path = require('path');

var starti =express();
starti.use(express.static( path.join(__dirname,'../static/coolify-server-webrtc')   )  )

const views = {
  //about: path.join(__dirname, '../../', 'public/views/about.html'),
  client: path.join(__dirname,'../static/coolify-server-webrtc/index.html')
  //landing: path.join(__dirname, '../../', 'public/views/landing.html'),
  //newCall: path.join(__dirname, '../../', 'public/views/newcall.html'),
  //notFound: path.join(__dirname, '../../', 'public/views/404.html'),
  //permission: path.join(__dirname, '../../', 'public/views/permission.html'),
  //privacy: path.join(__dirname, '../../', 'public/views/privacy.html'),
  //stunTurn: path.join(__dirname, '../../', 'public/views/testStunTurn.html'),
};

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  
  starti.get('/start', function (req, res) {
    //console.log(starti.mountpath) // /views
    //return
    res.sendFile(views.client);
    //res.send('User Homepage')
  })
  req.app.use('/start',starti) // mount the sub app
  
  res.status(200).redirect('/start')
  
  //var a = JSON.stringify({"msg":"messaggioMio"})
  //res.send(a);
  
  };


exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.installatorBoard = (req, res) => {
  //console.log('installatorBoard') // /views
  starti.get('/start', function (req, res) {
    
    //return
    res.sendFile(views.client);
    //res.send('User Homepage')
  })
  req.app.use('/start',starti) // mount the sub app
  
  res.status(200).redirect('/start')
  
};
