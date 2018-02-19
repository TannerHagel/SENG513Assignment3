const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cookieParser = require('cookie-parser');

// Setup handlebars with the 'main' default layout
var hbmain = handlebars.create({defaultLayout:'main'});
app.engine('handlebars', hbmain.engine);
app.set('view engine', 'handlebars');

app.use(cookieParser());

app.disable('x-powered-by'); // Do not tell the browsers of server information

// Use port 80
app.set('port', process.env.PORT || 80);

app.get('/', function(req, res) {
    //res.render('home');
    console.log("Cookies: ", req.cookies);
    if(!req.cookies.nickname) {
        res.cookie("nickname", Math.floor(Math.random() * 100));
    }
    res.sendFile(__dirname + '/public/index.html');
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
    socket.on('msg send', function(msg) {
        console.log("Message sent: " + msg);
        io.emit('msg send', msg);
    });
});

http.listen(app.get('port'), function() {
    console.log("Server started on port " + app.get('port'));
});
