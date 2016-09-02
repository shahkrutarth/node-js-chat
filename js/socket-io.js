var socket = io.connect();
var $messageForm = $('#chatMsgForm');
var $message = $('#chatMsgBox');
var $displayMsgBox = $('#chatMsgDisplayBox');
var $currentUserId = $('#cwUserId');
var $sessionUsers = $('#sessionUsers');

var chatTo = '';

// Used to send message to a particular user
function sendMessage(messageBoxObj, to) {
	socket.emit('client message', messageBoxObj.val(), to, $currentUserId.val());
	messageBoxObj.val('').focus();
}

function getChannelName(to, from) {
	channels = []
	channels.push(to);
	channels.push(from);
	channels = channels.sort();
	newChannel = channels.join('-');
	return newChannel;
}

$(document).ready(function() {
	$message.focus();
	// Initialize socket connection and add user
	socket.emit('init', $currentUserId.val());

	socket.on('server message', function(msg, channel) {
		// Change this as per new fb-style design
		$('#popup-messages-' + channel).append($('<li>').text(msg));
	});

	socket.on('change channel', function(newChannel) {
		if ($('#'+newChannel).html() != undefined) {
			// do something
		}
		// Show notification to user as some one wants to connect to that user
		$displayMsgBox.html('').append($('<li>').text('Connection Changed to : Channel ' + newChannel + ' !'));
		chatTo = newChannel;
	});

	socket.on('usernames', function(users) {
		// Update users list and display new users (only logged in users)
		element = '';
		for (var i = 0; i < users.length; i++) {
			if (users[i] == $currentUserId.val()) {
				// Do nothing, no need to show self in chat users list
			} else {
				var registerPopup = "javascript:register_popup('" + users[i] + "', '" + users[i] + "');"
				element += '<div class="sidebar-name" data-id="' + users[i] + '">';
				element += '<a href="' + registerPopup + '">';
				element += '<img width="30" height="30" src="http://qnimate.com/wp-content/uploads/2014/12/Screen-Shot-2014-12-15-at-3.48.21-pm.png" />';
				element += '<span>' + users[i] + '</span>';
				element += '</a></div>';
				$('.chat-sidebar').append(element);
			}
		}
		$('.sidebar-name').bind('click', function() {
			socket.emit('channel change', $(this).attr('data-id'), $currentUserId.val());
		});
	});
	
});