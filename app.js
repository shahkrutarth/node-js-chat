// Set root directory
ROOT_DIR = __dirname + '/';

var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	connectionDB = require('./config/connection');
	MongoClient = require('mongodb').MongoClient,
	randomString = require("randomstring"),
	path = require('path'),
	_ = require('underscore'),
	cwSockets = {},
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
console.log('Visit you browser and tyre http://localhost:3030\n');


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
	var channel = 'channel-a';
	// called when user accesses the app
	socket.on('init', function(username) {
		console.log('User initiated');
		console.log(username);
		users[username] = socket.id;    // Store a reference to your socket ID
        cwSockets[socket.id] = { username : username, socket : socket };  // Store a reference to your socket
        socket.leave(channel);
        socket.join(username);
        updateUsers();
	});

	socket.join(channel);

	socket.on('client message', function(msg, to, from) {
		// io.emit('message', msg, socket.id);
		console.log('New message from user: ' + to);
		var toMsg = from + ': ' + msg;
		var channelName = getChannel(to, from);
		io.sockets.in(channelName).emit('server message', toMsg, channelName);
	});

	socket.on('channel change', function(to, from) {
		socket.leave(channel);
		newChannel = getChannel(to, from);
		console.log('User has changed the channel to : ' + newChannel);
		socket.join(newChannel);
		socket.emit('change channel', to);
	});

	function updateUsers() {
		console.log('Users list updated');
		io.sockets.emit('usernames', Object.keys(users));
	}

	function iCaseCompare(strA, strB) {
	    return strA.toLowerCase().localeCompare(strB.toLowerCase());
	}
});