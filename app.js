const express = require('express')
const app = express();
const fs = require('fs');
const { v4: uuidV4 } = require('uuid');
const https = require('https');
const options = {
    key: fs.readFileSync('ssl/key.pem'),
    cert: fs.readFileSync('ssl/cert.pem')
};
const server = https.createServer(options, app);

const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ server });


app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use(express.json());  // parse application/json
app.use(express.json({type: 'application/vnd.api+json'}));  // parse application/vnd.api+json as json
app.use(express.urlencoded({ extended: true }));  // parse application/x-www-form-urlencoded


// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

// app.use(function(req, res, next) {
//     console.log(req.url);
//     if (req.url.search("peerjs") !== -1) {
//         // console.log(req.url);
//         // let url = req.url.slice(7);
//         // console.log(url);
//         res.redirect(`http://localhost:3001${req.url}`);
//     }
//     next();
// });

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});


// app.get('/:room', (req, res) => {
//     res.render('room', {
//         roomId: req.params.room
//     })
// });

app.get('/admin/:room', (req, res) => {
    return res.render('admin', {
        roomId: req.params.room,
        username: "Admin",
        key: options.key,
        cert: options.cert
    });
});

app.get('/client/:username/:room', (req, res) => {
    return res.render('client', {
        roomId: req.params.room,
        username: req.params.username,
        key: options.key,
        cert: options.cert
    });
});


wss.on('connection', function connection(socket) 
{
    socket.on('message', function incoming(message) 
    {
        let msg = JSON.parse(message);


        if (msg.event === "join-room") 
        {
            // if (msg.username !== "Admin")
            // {
            // }
            console.log("yes");

            // socket.send(JSON.stringify({
            //     event: 'user-connected',
            //     username: msg.username,
            //     userId: msg.userId
            // }));

            socket.send(JSON.stringify({
                event: 'hello'
            }));

            socket.on('close', function() 
            {
                socket.send(JSON.stringify({
                    event: 'user-disconnected',
                    userId: msg.userId
                }));
            });
        }

        else if (msg.event === "admin ended the call") 
        {
            socket.send(JSON.stringify({
                event: "admin ended the call",
                endedUserId: msg.endedUserId
            }));
        }

        else if (msg.event === "user ended the call") 
        {
            socket.send(JSON.stringify({
                event: "user ended the call",
                endedUserId: msg.endedUserId
            }));
        }


        
    });
});


server.listen(3000);
console.log("Server started listening on port 3000");
require('./peer-server.js');
