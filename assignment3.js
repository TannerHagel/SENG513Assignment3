const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cookieParser = require('cookie-parser');
const randName = require('./random_name.js');

var onlineUsers = {};

// Setup handlebars with the 'main' default layout
var hbmain = handlebars.create({defaultLayout:'main'});
app.engine('handlebars', hbmain.engine);
app.set('view engine', 'handlebars');

app.use(cookieParser());

app.disable('x-powered-by'); // Do not tell the browsers of server information

// Use port 80
app.set('port', process.env.PORT || 80);

app.get('/', function(req, res) {
    if(!req.cookies.nickname) {
        res.cookie("nickname", randName.genName());
    }
    if(!req.cookies.userid) {
        res.cookie("userid", Math.floor(Math.random() * 4294967296 )); // Generate a "32" bit ID
    }
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/online', function(req, res) {
   res.json(getOnline()); 
});

// Static serve 'public' folder
app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
    console.log("Client attempted to access " + req.url);
    res.status(404);
    res.render('404');

});

app.use(function(err, req, res, next) {
    console.error("Server Error: " + err);
    res.status(500);
    res.render('500');

});

io.on('connection', function(socket) {
    let cookies = socket.handshake.headers.cookie.split(";"); // This needs fixing
    let userVals = {connections: 1};

    for(element of cookies) {
        let e = element.trim();
        if(e.startsWith("nickname")) {
            userVals.nickname = e.split("=")[1];
        } else if(e.startsWith("userid")) {
            userVals.userid = e.split("=")[1];
        }
    }
    
    socket.on('msg send', function(msg, ackFunction) {
        msg.timestamp = Date.now();
        socket.broadcast.emit('msg send', msg);
        ackFunction(msg);
        /*setTimeout(function() {
            let nmsg = { msgid:msg.msgid, msg:"Edited message!" };
            io.emit('msg edit', nmsg);
        }, 3000);/**/
    });

    socket.on('get online', function(ackFunction) {
       ackFunction(getOnline());
    });

    socket.on('disconnect', function() {
        console.log(userVals.nickname + " has closed a socket.");
        if(onlineUsers[userVals.userid] !== undefined) {
            if(onlineUsers[userVals.userid].connections <= 1) { 
                onlineUsers[userVals.userid].timeout = setTimeout(function() {
                    delete onlineUsers[userVals.userid];
                    io.emit('user leave', userVals);
                }, 5000);
            } else {
                onlineUsers[userVals.userid].connections--;
            }
        }

    });

    if(onlineUsers[userVals.userid] === undefined) {
        onlineUsers[userVals.userid] = userVals;
        io.emit('user join', userVals);
    } else {
        if(onlineUsers[userVals.userid].timeout) {
            clearTimeout(onlineUsers[userVals.userid].timeout);
        } else {
            onlineUsers[userVals.userid].connections++;
        }
        delete onlineUsers[userVals.userid].timeout;
    }
    console.log("\n",onlineUsers);
});

function getOnline() {
    let ret = [];
    let pos = 0;
    for(user of Object.values(onlineUsers)) {
        ret[pos++] = { nickname:user.nickname, userid:user.userid };
    }
    return ret;
}


http.listen(app.get('port'), function() {
    console.log("Server started on port " + app.get('port'));
});
