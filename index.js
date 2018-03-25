var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var port = process.env.PORT || 3000;
var config = {};
try {config=require('./config.json')} catch(err){console.log('No config.json. Will try ENV.')};

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
app.use(express.static(path.join(__dirname, 'public')));


var teamlist = [];

function Team(TeamId,TeamName,TeamToken) {
  this.Id=TeamId;
  this.Name=TeamName;
  this.Token=TeamToken;
}

var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(process.env.CONNECTIONSTRING||config.ConnectionString, function(err, database) {
  if(err) { console.log(err); return 0;}
  const collection = database.db().collection(process.env.COLLECTION||config.Collection);
  collection.find({}).toArray(function(err, items) {

    items.forEach((team)=>{
      teamlist.push(new Team(team.Name,team.Name,team.Name))
    });

    console.log(items); database.close();
  });
});


io.on('connection', function (socket) {

  // socket.emit = reply only to the client who asked
  // socket.broadcast.emit = reply to all clients except the one who asked
  // io.sockets.emit = reply to all clients (including the one who asked)

  //socket.emit('data',{welcomemessage: 'Welcome!'});

  socket.on('data', function () {
    socket.emit('data', JSON.stringify(teamlist));
  });

});
