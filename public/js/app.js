angular.module('pollApp', [])
.factory('socket', function($rootScope) {
		var socket = io.connect();
		return {
			on: function (eventName, callback) {
     socket.on(eventName, function () {
var args = arguments;
$rootScope.$apply(function () {
callback.apply(socket, args);
});
});
},
emit: function (eventName, data, callback) {
socket.emit(eventName, data, function () {
var args = arguments;
$rootScope.$apply(function () {
if (callback) {
callback.apply(socket, args);
}
});
});
}
};
})

.controller('PollCtrl', ['$scope','socket', function($scope,socket){
	$scope.poll={};

	socket.on('voted',function(data){
		console.dir(data);
		//$scope.poll=data;
		$scope.poll.choices=data.choices;
		$scope.poll.totalVotes=data.totalVotes;

	});


	$scope.vote=function(){
		//用户选了之后
		choiceId=$scope.poll.userVote;
		if(choiceId){
			var voteObj={choice:choiceId};

			socket.emit('send:vote',voteObj);
		}else{
			alert('Please make a choice to help us make the right choice');
		}
	};
}
]);