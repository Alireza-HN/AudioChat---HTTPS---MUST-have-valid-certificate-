const fs = require('fs');
const ip = require('ip');
const path = require('path');
let PeerServer = require('peer').PeerServer;

let port = 3001;
let server = new PeerServer({
port: port,
  ssl: {
    key: fs.readFileSync(path.join(__dirname + '/ssl/key.pem')),
    cert: fs.readFileSync(path.join(__dirname + '/ssl/cert.pem'))
  },
  allow_discovery: true
});


server.on('connection', function (id) {
  console.log('new connection with id: ', id.id);
});

server.on('disconnect', function (id) {
  console.log('disconnect with id: ' + id.id);
});


console.log('peer server running on ' + ip.address() + ':' + port);



module.exports;