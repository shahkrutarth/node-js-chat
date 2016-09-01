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
	if (loginAs === 'workshop') {
		return "CW-WS-"+userId;
	} else if (loginAs === 'asktheexpert') {
		return "CW-ATE-"+userId;
	} else {
		return "CW-CHAT-"+userId;
	}
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

	socket.on('message', function(msg, currentChannel) {
		// io.emit('message', msg, socket.id);
		console.log('New message from user');
		io.sockets.in(currentChannel).emit('message', msg, socket.id);
	});

	socket.on('channel change', function(to, from) {
		socket.leave(channel);
		channels = []
		channels.push(to);
		channels.push(from);
		channels = channels.sort();
		newChannel = channels.join('-');
		console.log('User has changed the channel to : ' + newChannel);
		socket.join(newChannel);
		socket.emit('change channel', newChannel);
	});

	function updateUsers() {
		console.log('Users list updated');
		io.sockets.emit('usernames', Object.keys(users));
	}

	function iCaseCompare(strA, strB) {
	    return strA.toLowerCase().localeCompare(strB.toLowerCase());
	}
});











io.sockets.on('connectionssss', function(socket) {
	// All socket will be listened here and will be initiated from here
	
	// When user joins WS chat window
	socket.on('Active Users WS support', function(cwUserId, callback) {
		if (_.has(users, cwUserId)) {
			callback(false);
		} else {
			callback(true);
			socket.cwUserId = cwUserId;
			users[socket.cwUserId] = socket;
			updateUsers();
		}
	});

	// When user joins ATE chat window
	socket.on('Active Users ATE support', function(data, callback) {

	});

	// When user pings on WS chat window
	socket.on('WS support receive', function(data, callback) {
		var msg = data.msg.trim();
		/*if(!_.has(users, data.userIdFrom)) {
			socket.cwUserId = data.userIdFrom;
			users[socket.cwUserId] = socket;
		}*/
		if(!_.has(users, data.userIdTo)) {
			socket.cwUserId = data.userIdTo;
			users[socket.cwUserId] = socket;
		}
		console.log(users[data.userIdFrom].cwUserId)
		io.sockets.emit('new message', {msg: msg, user: socket.cwUserId});
		// io.sockets.users[data.userIdTo].emit('WS support send', {msg: msg, user: socket.cwUserId});
		// users[data.userIdTo].emit('WS support send', {msg: msg, user: socket.cwUserId});
		console.log(users[data.userIdTo].broadcast.to(socketid));
		if (_.has(users, data.userIdFrom)) {
			io.sockets.users[data.userIdFrom].emit('WS support send', {msg: msg, user: socket.cwUserId});
			// users[data.userIdFrom].emit('WS support send', {msg: msg, user: socket.cwUserId});
		} else {
			callback("User is Currently offline, your message will be delivered once user comes online");
		}
		// users[data.userIdFrom].emit('WS support send', {msg: msg, user: data.userIdFrom});
		/*if (data.userIdFrom in users) {
			users[data.userIdFrom].emit('WS support send', {msg: msg, user: socket.cwUserId});
			users[data.userIdTo].emit('WS support send', {msg: msg, user: socket.cwUserId});
		} else {
			socket.cwUserId = data.userIdFrom;
			users[socket.cwUserId] = socket;
			users[data.userIdFrom].emit('WS support send', {msg: msg, user: socket.cwUserId});
			users[data.userIdTo].emit('WS support send', {msg: msg, user: socket.cwUserId});
		}*/
	});

	// workshop hanshake
	/*var userSocket = [];
	socket.on('WS handshake', function (user) {
		if (userSocket[user] === undefined) userSocket[user] = [];
		userSocket[user].push(socket.id);
	});*/

	// When user pings on ATE chat window
	socket.on('ATE support receive', function(data, callback) {
		
	});

	// Disconnect from socket when window is closed
	socket.on('disconnect', function (argument) {
		if (!socket.cwUserId) { return }
		delete users[socket.cwUserId]
		updateUsers();
	});

	// Update user list
	function updateUsers() {
		io.sockets.emit('usernames', Object.keys(users));
	}
});







/*io.sockets.on('connection', function(socket) {

	

	socket.on('send message', function(data, callback) {
		var msg = data.trim();
		if (msg.substr(0, 3) === '/w ') {
			msg = msg.substr(3);
			ind = msg.indexOf(' ');
			if (ind !== -1) {
				var name = msg.substring(0, ind);
				var msg = msg.substring(ind + 1);
				if (name in users) {
					users[name].emit('private', {msg: msg, user: socket.cwUserId});
					console.log('"hisssanmsdm,nas');
				} else {
					callback('Error! No such user found');
				}
			} else {
				callback('Error! Please enter a message to communicate');
			}
		} else {
			io.sockets.emit('new message', {msg: msg, user: socket.cwUserId});
		}
	});

	socket.on('new user', function(data, callback) {
		if (data in users) {
			callback(false);
		} else {
			callback(true);
			socket.cwUserId = data;
			users[socket.cwUserId] = socket;
			updateUsers();
		}
	});

	function updateUsers() {
		io.sockets.emit('usernames', Object.keys(users));
	}

	socket.on('disconnect', function (argument) {
		if (!socket.cwUserId) { return }
		delete users[socket.cwUserId]
		updateUsers();
	});
});*/