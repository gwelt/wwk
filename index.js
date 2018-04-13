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

function Team(ID,Name,Chef,R1,R2,R3,R4,R5,Standby) {
  this.ID=ID;
  this.Name=Name;
  this.Chef=Chef;
  this.R1=R1;
  this.R2=R2;
  this.R3=R3;
  this.R4=R4;
  this.R5=R5;
  this.Standby=Standby;
}

io.on('connection', function (socket) {
  // socket.emit = reply only to the client who asked
  // socket.broadcast.emit = reply to all clients except the one who asked
  // io.sockets.emit = reply to all clients (including the one who asked)
  //socket.emit('data',{welcomemessage: 'Welcome!'});

  socket.on('get_data', function () {
    socket.emit('data', JSON.stringify(teamlist));
  });
  socket.on('update_all_clients', function () {
    io.sockets.emit('data', JSON.stringify(teamlist));
  });
  socket.on('reload_from_db', function () {
    get_teamlist_from_db((list)=>{teamlist=list;io.sockets.emit('data', JSON.stringify(teamlist));});
  });
  socket.on('write_to_db', function (json) {
    console.log(json);
    data = JSON.parse(json.data);
    // find teamlist-Item
    var i=0; while (i<teamlist.length && teamlist[i].ID!=data.ID) {i++}
    if (i<teamlist.length && json.token=='ERGO'+data.ID) {
      // update in object
      teamlist[i]=new Team(data.ID,data.Name,data.Chef,data.R1,data.R2,data.R3,data.R4,data.R5,data.Standby);
      io.sockets.emit('data', JSON.stringify(teamlist));
      io.sockets.emit('info', {ID:data.ID,info:'updated',color:'green'});
      // update in DB
      collection.update({ID:data.ID}, teamlist[i], {upsert:false,w:1}, function(err, doc) {
        console.log('write to db: ID='+data.ID+' error='+err);
      });
    }
    else {console.log('Could not find/update ID '+data.ID+'.')}
  });

});

var database,collection;

var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(process.env.CONNECTIONSTRING||config.ConnectionString, function(err, db) {
  if(err) { console.log(err); return 0;}
  database = db;
  collection = db.db().collection(process.env.COLLECTION||config.Collection);
  get_teamlist_from_db((list)=>{teamlist=list});
});

function get_teamlist_from_db(callback) {
  var teamlist=[];
  collection.find({}).sort({ID:1}).toArray(function(err, items) {
    items.forEach((team)=>{
      teamlist.push(new Team(team.ID,team.Name,team.Chef,team.R1,team.R2,team.R3,team.R4,team.R5,team.Standby))
    });
    console.log(JSON.stringify(teamlist));
    callback(teamlist);
  });
}

process.on('SIGINT', function(){console.log('SIGINT'); database.close(function (err,res){if (err){console.log(err)} else {console.log('DB-connection closed '+res)}; process.exit()})});
process.on('SIGTERM', function(){console.log('SIGTERM'); database.close(function (err,res){if (err){console.log(err)} else {console.log('DB-connection closed '+res)}; process.exit()})});
