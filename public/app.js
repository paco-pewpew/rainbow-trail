'use strict';
angular.module('chatApp',['SocketService'])
	.controller('ChatCtrl',['$scope','socketio','$window',function($scope,socketio,$window){
		/*$scope.messages=[{user:'server',text:'Hello'}];
		$scope.message;*/
		$scope.isLogged=false;
		$scope.inGame=false;
		$scope.searchingForGame=false;
		$scope.turn='idle';
		$scope.gameHistory=[];

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
			delete $scope.gameData;
			$scope.searchingForGame=true;
			socketio.emit('find game',{name:$scope.username});
		};

		socketio.on('game start',function(msg){
			console.log(msg);
			$scope.searchingForGame=false;
			$scope.inGame=true;
			$scope.gameData=msg.data;
		});

		socketio.on('game update',function(msg){
			console.log(msg);
			$scope.gameData=msg.data;
		});

		socketio.on('game stop',function(msg){
			//$scope.inGame=false;
			$scope.gameData=msg.data;
			$scope.stopReason=msg.msg;
			$scope.inGame=false;
			$scope.gameHistory.unshift({game:msg.data.name,winner:msg.data.gameData[msg.data.gameData.winner].name})

			console.log(msg);
			console.log($scope.gameHistory);
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
					'background-size':'100% 100%',
					'background-repeat':'no-repeat',
					'border':'3px ridge #c3c3c3',
					'border-radius':'50%',
					'height':'100px',
					'padding':'0px'
					});
				});
			}
		};
	})
.directive('gamehistory',function(){
	return{
		restrict:'EA',
		link:function(scope,element,attrs){
			//SNEAKY
		}	
	};
});
