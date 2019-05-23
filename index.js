var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var fs = require('fs');
var port = process.env.PORT || 3000;
var config = {};
try {config=require('./config.json')} catch(err){console.log('No config.json. Will try ENV.')};

var teamlist = [];

server.listen(port, function () {
  console.log('Server listening at port %d', port);
  get_teamlist_from_file((list)=>{teamlist=list});
});
app.use('/api/:r', function (req, res, next) {
  switch (req.params.r) {
    case 'teams':
      res.send(JSON.stringify(teamlist));
      break;
    default:
      res.send('Valid API-calls: <a href=/api/teams>/api/teams</a>');
  }
})
app.use(express.static(path.join(__dirname, 'public')));

function Team(ID,Name,Chef,R1,R2,R3,R4,R5,Standby,Code) {
  this.ID=ID;
  this.Name=Name;
  this.Chef=Chef;
  this.R1=R1;
  this.R2=R2;
  this.R3=R3;
  this.R4=R4;
  this.R5=R5;
  this.Standby=Standby;
  this.Code=Code;
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
  socket.on('auth', function (data) {
    var i=0; while (i<teamlist.length && teamlist[i].ID!=data.id) {i++};
    if (i<teamlist.length) {
      socket.emit('authresult', {'id':data.id, 'code':data.code, 'result':auth(data.code,teamlist[i].Code)})
    } else {
      socket.emit('authresult', {'id':data.id, 'code':data.code, 'result':false})
    }
  });
  socket.on('reload_from_db', function () {
    get_teamlist_from_file((list)=>{teamlist=list;io.sockets.emit('data', JSON.stringify(teamlist));});
  });
  socket.on('write_to_db', function (json) {
    console.log(json);
    data = JSON.parse(json.data);
    // find teamlist-Item
    var i=0; while (i<teamlist.length && teamlist[i].ID!=data.ID) {i++}
    if (i<teamlist.length && auth(json.code,teamlist[i].Code)) {
      // update in object
      teamlist[i]=new Team(data.ID,data.Name,data.Chef,data.R1,data.R2,data.R3,data.R4,data.R5,data.Standby,crypt(json.code));
      io.sockets.emit('data', JSON.stringify(teamlist));
      io.sockets.emit('info', {ID:data.ID,info:'updated',color:'green'});
    }
    else {
      console.log('Could not find/update ID '+data.ID+'.');
      socket.emit('info', {ID:data.ID,info:'Falscher Code!',color:'red'});
    }
  });

});

function get_teamlist_from_file(callback) {
  var teamlist=[];
  fs.readFile(config.datafilepath+'/'+config.datafile, 'utf8', (err, data_encrypted)=>{
    if (err){console.log('No data-file.')} else {
      // decrypt
      try {data_encrypted=decrypt(JSON.parse(data_encrypted))} catch (err) {console.log('decryption failed',err)}
      try {data = JSON.parse(data_encrypted)} catch (err) {data={}};

      data.forEach((team)=>{
        teamlist.push(new Team(team.ID,team.Name,team.Chef,team.R1,team.R2,team.R3,team.R4,team.R5,team.Standby,team.Code))
      });
      console.log(JSON.stringify(teamlist));
    }
    callback(teamlist);
  });
}

function save_to_file(callback,backup) {
  // encrypt
  let data=encrypt(JSON.stringify(teamlist));
  fs.writeFile(config.datafilepath+'/'+config.datafile, data, 'utf8', (err)=>{
    console.log('File '+config.datafilepath+'/'+config.datafile+' saved.'+(err?' !!! '+err:''));
    // save backup
    if (backup) {
      config.datafilepath+='/backup';
      filename=hash(JSON.stringify(teamlist));
      fs.writeFile(config.datafilepath+'/'+filename, data, 'utf8', (err)=>{
        console.log('File '+config.datafilepath+'/'+filename+' saved.'+(err?' !!! '+err:''));
        callback();
      });
    } else {
      callback();
    }
  });
}

const crypto = require('crypto');
function encrypt(text) {
  if (!config.cryptosecret.length) return text; // do not encrypt //
  let iv=crypto.randomBytes(16);
  let cipher = crypto.createCipheriv('aes-256-cbc', getCipherKey(process.env.SECRET||config.cryptosecret), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return JSON.stringify({ iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') });
}
function decrypt(text) {
  if (!config.cryptosecret.length) {throw 'because no cryptosecret is given'}; // do not decrypt //
  let iv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', getCipherKey(process.env.SECRET||config.cryptosecret), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
function getCipherKey(key) {if ((typeof key!= 'string')||(key.length<1)) {key="nosecret"}; while (key.length<32) {key+=key}; while (key.length>32) {key=key.slice(0,-1)}; return key;}

function crypt(str) {
  return crypto.createHmac('sha256','dontwanttousesalthere').update(str).digest('base64');
}
function hash(data) {
  return require('crypto').createHash('md5').update(data).digest("hex");
}
function auth(password,hash) {
  //console.log('AUTH '+password+' '+crypt(password)+' '+hash)
  return ( (typeof hash === 'undefined') || (hash === crypt(password)) );
}

process.on('SIGINT', function(){ if (config.SIGINT==undefined) {config.SIGINT=true; console.log('SIGINT'); save_to_file(()=>{process.exit(0)},true)} });
process.on('SIGTERM', function(){ if (config.SIGTERM==undefined) {config.SIGTERM=true; console.log('SIGTERM'); save_to_file(()=>{process.exit(0)},true)} });
