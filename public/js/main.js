$(function(){

	var $nickForm = $('.set-nick');
	var $nickError = $('.nickerror');
	var $nickBox = $('.nickname');

	var $messageForm = $('.send-message');
	var $messageBox = $('.msg-box');
	var $chat = $('.chat');
	var socket = io.connect('http://localhost:3000');

	$nickForm.submit(function(e){
		e.preventDefault();
		socket.emit('newUser', $nickBox.val(), function(data){
			if(data){
				$('.nick-wrap').hide();
				$('.content-wrap').show();
			} else{
				$nickError.html('That username is already taken! Please try again.');
			}
		});
		$nickBox.val('');
	});

	socket.on('usernames', function(data){
		var html = '';
		for(var i=0; i < data.length; i++){
			html += data[i] + '<br/>';
		}

	});

	$messageForm.submit(function(e){
		e.preventDefault();
		socket.emit('sendMsg', $messageBox.val(), function(data){
			$chat.append('<span class="error">' + data + "</span><br/>");
		});
		$messageBox.val('');
	});

	socket.on('oldMsgs', function(docs){
		for(var i=docs.length-1; i >= 0; i--){
			displayMsg(docs[i]);
		}
	});

	socket.on('newMsg', function(data){
		displayMsg(data);
	});

	function displayMsg(data){
		$chat.append('<span class="msg"><b>' + data.nick + ': </b>' + data.msg + "</span><br/>");
	}

	socket.on('whisper', function(data){
		$chat.append('<span class="whisper"><b>' + data.nick + ': </b>' + data.msg + "</span><br/>");
	});
 $('.single-item').slick({
 autoplay: true,
 autoplaySpeed: 2000,
 });
	});