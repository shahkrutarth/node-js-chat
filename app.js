// Set root directory
ROOT_DIR = __dirname + '/';

// Load all required packages
var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	connectionDB = require('./config/connection');
	MongoClient = require('mongodb').MongoClient,
	randomString = require("randomstring"),
	path = require('path'),
	_ = require('underscore'),
	users = {};

// Load mongoDB connection file
connectionDB = require('./config/connection');

// get mongoDB connection object to use t further
connectionDB.connectToMongo(function(data) {
  	mongoObj = data
});

swig = require('swig');
swig.setDefaults({
  locals: {
    range: function(start, len) {
      return (new Array(len)).join().split(',').map(function(n, idx) {
        return idx + start;
      });
    }
  }
});

app.set('view engine', 'html');
app.engine('html', swig.renderFile);

// Start you chat application on below port
server.listen(3030);
console.log('Visit you browser with http://localhost:3030 to start playing with chat app\n');


app.use(express.static(path.join(__dirname, '.'),[{'Last-Modified':'TRUE'}]));


// Set default route for chat
app.get('/', function(req, res) {
	res.render(ROOT_DIR + 'client/index', {"userId": generateRandomUserId()});
});

function generateRandomUserId(loginAs) {
	userId = randomString.generate({
	  length: 4,
	  charset: 'alphanumeric'
	});
	return "USER-"+userId;
}

function getChannel(to, from) {
	channels = []
	channels.push(to);
	channels.push(from);
	channels = channels.sort();
	newChannel = channels.join('-');
	return newChannel;
}

// Open Socket Connection
io.sockets.on('connection', function(socket) {

	// called when user accesses the app
	socket.on('init', function(username) {
		console.log('User initiated with user id : ' + username);
		users[username] = socket.id;    // Store a reference to your socket ID
		socket.cwUserId = username;
        socket.join(username);
        updateUsers();
	});

	socket.on('client message', function(msg, to, from) {
		var toMsg = from + ': ' + msg;
		var channelName = getChannel(to, from);
		io.sockets.in(channelName).emit('server message', toMsg, channelName);
	});

	socket.on('channel change', function(to, from) {
		// socket.leave(channel);
		newChannel = getChannel(to, from);
		socket.join(newChannel);
		console.log('\n"' + from + '" Joined new channel "' + newChannel + '" to communicate with "' + to + '"\n');
		socket.emit('change channel', to);
	});

	// Leave channel when user closes the pop-up window
	socket.on('channel disconnect', function(channelName) {
		console.log('\n' + socket.cwUserId + ' Left the Channel: ' + channelName);
		socket.leave(channelName);
	});

	// Disconnect from socket when window is closed
	socket.on('disconnect', function (argument) {
		if (!socket.cwUserId) { return }
		delete users[socket.cwUserId]
		updateUsers();
	});

	function updateUsers() {
		io.sockets.emit('usernames', Object.keys(users));
	}
});