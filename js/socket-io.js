var socket = io.connect();
var $messageForm = $('#chatMsgForm');
var $message = $('#chatMsgBox');
var $displayMsgBox = $('#chatMsgDisplayBox');
var $currentUserId = $('#cwUserId');
var $sessionUsers = $('#sessionUsers');

function getChannelName(to, from) {
	channels = []
	channels.push(to);
	channels.push(from);
	channels = channels.sort();
	newChannel = channels.join('-');
	return newChannel;
}

// Leave channel when user closes the pop-up window
function disconnectFromChannel(channelName) {
	socket.emit('channel disconnect', channelName);
}

// Triggered at every user message submission
$(document).on('submit', '.fb-chatMsgForm', function(e) {
	e.preventDefault();
	var $messageBox = $('#fb-chatMsgBox'+this.id);
	socket.emit('client message', $messageBox.val(), this.id, $currentUserId.val());
	$messageBox.val('').focus();
});

// Chat with particular user
$(document).on('click', '.sidebar-name', function() {
	socket.emit('channel change', $(this).attr('data-id'), $currentUserId.val());
});

$(document).ready(function() {
	$message.focus();
	// Initialize socket connection and add user
	socket.emit('init', $currentUserId.val());

	// Append message received from server
	socket.on('server message', function(msg, channel) {
		$('#popup-messages-' + channel).append($('<li>').text(msg));
	});

	socket.on('change channel', function(newChannel) {
		if ($('#sidebar-name_'+newChannel).html() != undefined) {
			// do something
			// Show notification to user as some one wants to connect to that user
			// Need to work on this
		}
	});

	// Update users list and display new users (only logged in users)
	socket.on('usernames', function(users) {
		$('.chat-sidebar').html('');
		for (var i = 0; i < users.length; i++) {
			element = '';
			if (users[i] == $currentUserId.val()) {
				// Do nothing, no need to show your self in chat users list
			} else {
				var registerPopup = "javascript:register_popup('" + users[i] + "', '" + users[i] + "');"
				element += '<div class="sidebar-name" data-id="' + users[i] + '" id="sidebar-name_' + users[i] + '">';
				element += '<a href="' + registerPopup + '">';
				element += '<img width="30" height="30" src="/images/chat-01.png" />';
				element += '<span>' + users[i] + '</span>';
				element += '</a></div>';
				$('.chat-sidebar').append(element);
			}
		}
	});
});