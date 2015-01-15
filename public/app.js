'use strict';
angular.module('chatApp',['SocketService'])
	.controller('ChatCtrl',['$scope','socketio',function($scope,socketio){
		$scope.messages=[{user:'server',text:'Hello'}];
		$scope.message;
		$scope.isLogged=false;
		$scope.inGame=false;
		$scope.turn='idle';

		$scope.setTurn=function(way){
			$scope.turn=way;
			//broadcast to my room
			socketio.emit('change direction',way);
		};

		$scope.setName=function(){
			console.log('fired');
			$scope.isLogged=true;
		};
		
		$scope.findGame=function(){
			socketio.emit('find game',{name:$scope.username});
		};

		socketio.on('game start',function(msg){
			console.log(msg);
			$scope.inGame=true;
			$scope.gameData=msg.data;
		});

		socketio.on('game update',function(msg){
			console.log(msg);
			$scope.gameData=msg.data;
		});

		socketio.on('game stop',function(msg){
			//$scope.inGame=false;
			console.log(msg);
		});
	}])

.directive('gamestick',function(){
		return{
			restrict:'EA',
			link:function(scope,element,attrs){
				//var cP=attrs.colorPositive;
				//var cN=attrs.colorNegative;
				attrs.$observe('turn',function(value){
					console.log(value);
					element.css({
					'background-image': 'url(../img/gameStick_'+value+'.png)',
					//'background-size':'100px 100px',
					'background-size':'cover',
					'baclground-repeat':'no-repeat',
					'height':'100px',
					'padding':'0px'
					});
				});
			}
		};
	});
