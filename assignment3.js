const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cookieParser = require('cookie-parser');
const userManager = require('./user_manager.js');
const roomManager = require('./room_manager.js');

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
    if(req.cookies.userid && !userManager.getUser(req.cookies.userid)) {
        res.clearCookie("userid");
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
    console.error(err.stack);
    res.status(500);
    res.render('500');

});

let defaultRoom = "Lobby";
roomManager.makeRoom(defaultRoom);
roomManager.makeRoom("Lobby 2");
roomManager.makeRoom("Third Room");
roomManager.makeRoom("Fourth Room");
roomManager.makeRoom("Fifth Room");


io.on('connection', function(socket) {
    let userid = (socket.handshake['query'] ? socket.handshake['query']['userid'] : undefined);
    let userVals = userManager.getUser(userid);
    if(!userVals) {
        console.log("Cannot find user: " + userid);
        userVals = userManager.genUser();
    }

    socket.on('join room', function(room, ackFunction) {
        if(room === null) {
            room = defaultRoom;
        }

        let roomKey = roomManager.exists(room);
        if(!roomKey) {
            roomKey = roomManager.makeRoom(room);
            if(!roomKey) {
                socket.emit("alert", "That room does not exist");
                ackFunction && ackFunction(false);
                return;
            }
        }

        if(socket.clack_room) {
            io.to(socket.clack_room).emit("user leave", getOutboundUser(userVals));
            roomManager[socket.clack_room].leave(userVals);
            socket.leave(socket.clack_room);
        }

	console.log(userVals.nickname + " is joining room " + roomKey);
        socket.clack_room = roomKey;
        roomManager[roomKey].join(userVals);
        socket.join(roomKey);
        io.to(roomKey).emit("user join", getOutboundUser(userVals));
        ackFunction && ackFunction(roomKey);
        socket.emit("alert", "Joined room " + roomKey);
    });

    socket.on('msg send', function(msg, ackFunction) {
        if(msg.msg.startsWith("/")) {
            if(parseCommand(msg.msg, userVals, socket)) {
                ackFunction();
                return;
            }
        }
        msg.timestamp = Date.now();
        msg.nickcolor = userVals.nickcolor;
        msg.nickname = userVals.nickname;
        msg.userid = userVals.userid;
        roomManager[socket.clack_room].addMsg(msg);
        socket.broadcast.to(socket.clack_room).emit('msg send', msg);
        ackFunction(msg);
        /*setTimeout(function() {
            let nmsg = { msgid:msg.msgid, msg:"Edited message!" };
            io.emit('msg edit', nmsg);
        }, 3000);/**/
    });

    socket.on('get history', function(ackFunction) {
        if(socket.clack_room) {
            ackFunction && ackFunction(roomManager[socket.clack_room].getMessages());
        } else {
            ackFunction && ackFunction(false);
        }
    });

    socket.on('get self', function(ackFunction) {
        ackFunction && ackFunction(getOutboundUser(userVals));
    });

    socket.on('get online', function(ackFunction) {
       ackFunction && ackFunction(roomManager[socket.clack_room].online());
    });

    socket.on("get rooms", function(ackFunction) {
        ackFunction && ackFunction(roomManager.rooms());
    });

    socket.on('disconnect', function() {
        console.log(userVals.nickname + " has closed a socket.");
        if(socket.clack_room) {
            roomManager[socket.clack_room].leave(userVals);
        }
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
        //io.emit('user join', getOutboundUser(userVals));
        userVals.connections = 1;
    } else {
        if(onlineUsers[userVals.userid].timeout) {
            clearTimeout(onlineUsers[userVals.userid].timeout);
        } else {
            onlineUsers[userVals.userid].connections++;
        }
        delete onlineUsers[userVals.userid].timeout;
    }
});

function parseCommand(msg, user, socket) {
    let arr = msg.split(" ");

    let cmd = (arr[0].charAt(0) === "/" ? arr[0].substring(1) : arr[0]);
    let args = arr.slice(1);

    switch(cmd.toLowerCase()) {
        case "n":
        case "nick":
        case "nickname":
            let nickname = args.join(" ").trim();
            if(userManager.changeName(user, nickname)) {
                let outUser = getOutboundUser(user);
                socket.emit("self update", outUser);
                io.emit("user update", outUser);
            } else {
                socket.emit("alert", "Failed to change nickname!");
            }
            return true;

        case "c":
        case "nc":
        case "color":
        case "nickcolor":
            if(args.length > 0) {
                let color = (args[0].charAt(0) === "#" ? args[0].substring(1) : args[0]);
                if(color.match(/^[a-fA-F0-9]{3}$|^[a-fA-F0-9]{6}$/) != null) {
                    user.nickcolor = "#" + color;
                    let outUser = getOutboundUser(user);
                    socket.emit("self update", outUser);
                    io.emit("user update", outUser);
                } else {
                    socket.emit("alert", "Invalid color code!");    
                }
            }
            return true;
    }

    return false;

}


function getOutboundUser(userVals) {
    return {nickname:userVals.nickname, userid:userVals.userid, nickcolor:userVals.nickcolor};
}

function getOnline() {
    let ret = [];
    let pos = 0;
    for(user of Object.values(onlineUsers)) {
        ret[pos++] = getOutboundUser(user);
    }
    return ret;
}


http.listen(app.get('port'), function() {
    console.log("Server started on port " + app.get('port'));
});
