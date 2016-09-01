var socket = io.connect();
var $messageForm = $('#chatMsgForm');
var $message = $('#chatMsgBox');
var $displayMsgBox = $('#chatMsgDisplayBox');
var $currentUserId = $('#cwUserId');
var $sessionUsers = $('#sessionUsers');

var chatTo = '';

$(document).ready(function() {
	$message.focus();

	socket.emit('init', $currentUserId.val());

	$messageForm.submit(function(e) {
		if ($message.val() === '') {
			return false;
		} else {
			socket.emit('message', $message.val(), chatTo);
			$message.val('').focus();
			return false;
		}
	});

	$sessionUsers.change(function() {
		console.log('channel change event triggered');
		socket.emit('channel change', $(this).val(), $currentUserId.val());
	});

	socket.on('message', function(msg, id) {
		$displayMsgBox.append($('<li>').text(id + ': ' + msg));
	});

	socket.on('change channel', function(newChannel) {
		$displayMsgBox.html('').append($('<li>').text('Connection Changed to : Channel ' + newChannel + ' !'));
		chatTo = newChannel;
	});

	socket.on('usernames', function(users) {
		$sessionUsers.html('');
		$sessionUsers.append('<option value=""> Select User to Start Chat </option>');
		for (var i = 0; i < users.length; i++) {
			if (users[i] == $currentUserId.val()) {
				$sessionUsers.append('<option value="' + users[i] + '"> Me </option>');
			} else {
				$sessionUsers.append('<option value="' + users[i] + '">' + users[i] + '</option>');
			}
			
		}
	});
});