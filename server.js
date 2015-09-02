var express = require('express'),
	app = express(),
	methodOverride = require('method-override'),
	bodyParser = require('body-parser'),
    server = require('http').createServer(app),
	io=require('socket.io').listen(server);
	path=require('path'),
	users = {};
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(methodOverride());


app.use(function(err,req,res,next){
	if(!err) return next();
	console.log(err.stack);
	res.json({error:true});
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

app.use(express.static(path.join(__dirname,'/public')));
app.set('/views', __dirname + '/public/views');

//connect mongodb
var mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/chat', function(err){
	if(err){
		console.log(err);
	} else{
		console.log('Connected to mongodb!');
	}
});

//difine schema
var chatSchema = mongoose.Schema({
	nick: String,
	msg: String,
	created: {type: Date, default: Date.now}
});

//define model
var Chat = mongoose.model('Message', chatSchema);


io.sockets.on('connection', function(socket){
	var query = Chat.find({});
	query.sort('-created').limit(8).exec(function(err, docs){
		if(err) throw err;
		socket.emit('oldMsgs', docs);
	});

	socket.on('newUser', function(data, callback){
		if (data in users){
			callback(false);
		} else{
			callback(true);
			socket.nickname = data;
			users[socket.nickname] = socket;
			updateNicknames();
		}
	});

	function updateNicknames(){
		io.sockets.emit('usernames', Object.keys(users));
	}

	socket.on('sendMsg', function(data, callback){
		var msg = data.trim();
		console.log('Trimed message: ' + msg);
		if(msg.substr(0,3) === '/w '){
			msg = msg.substr(3);
			var ind = msg.indexOf(' ');
			if(ind !== -1){
				var name = msg.substring(0, ind);
				msg = msg.substring(ind + 1);
				if(name in users){
					users[name].emit('whisper', {msg: msg, nick: socket.nickname});
					console.log('Message sent: ' + msg);
					//console.log('Whisper!');
				} else{
					callback('Error!  Enter a valid user.');
				}
			} else{
				callback('Error!  Please enter a message.');
			}
		} else{
			var newMsg = new Chat({msg: msg, nick: socket.nickname});
			newMsg.save(function(err){
				if(err) throw err;
				io.sockets.emit('newMsg', {msg: msg, nick: socket.nickname});
			});
		}
	});

	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		delete users[socket.nickname];
		updateNicknames();
	});
});
server.listen(app.get('port'), function(){
       console.log('Express server on port ' + app.get('port'));
    });