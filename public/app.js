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
			$scope.gameHistory.unshift({game:msg.data.name,winner:msg.data.gameData[msg.data.gameData.winner].name});

			console.log(msg);
			console.log($scope.gameHistory);
		});

		//keyboard controlls
		$window.addEventListener('keydown', function(event) {
		  switch (event.keyCode) {
		    case 37: // Left
		      $scope.setTurn('left');
		    break;

		    case 38: // Up
		      $scope.setTurn('up');
		    break;

		    case 39: // Right
		      $scope.setTurn('right');
		    break;

		    case 40: // Down
		      $scope.setTurn('down');
		    break;
		  }
		}, false);
	}])

.directive('gamestick',function(){
		return{
			restrict:'EA',
			link:function(scope,element,attrs){
				attrs.$observe('turn',function(value){
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
.directive('gamecell',function(){
	return{
		restrict:'EA',
		scope:{mapcell:'@'},
		link:function(scope,element,attrs){
			var rotate=0;
			switch(scope.mapcell){
				case('p1tail_right_right'):
				scope.mapcell='tail_forward';
				rotate=0;
				break;
				case('p1tail_down_down'):
				scope.mapcell='tail_forward';
				rotate=90;
				break;
				case('p1tail_left_left'):
				scope.mapcell='tail_forward';
				rotate=180;
				break;
				case('p1tail_up_up'):
				scope.mapcell='tail_forward';
				rotate=270;
				break;

				case('p1tail_right_down'):
				scope.mapcell='tail_turnRight';
				rotate=0;
				break;
				case('p1tail_down_left'):
				scope.mapcell='tail_turnRight';
				rotate=90;
				break;
				case('p1tail_left_up'):
				scope.mapcell='tail_turnRight';
				rotate=180;
				break;
				case('p1tail_up_right'):
				scope.mapcell='tail_turnRight';
				rotate=270;
				break;

				case('p1tail_right_up'):
				scope.mapcell='tail_turnLeft';
				rotate=0;
				break;
				case('p1tail_up_left'):
				scope.mapcell='tail_turnLeft';
				rotate=270;
				break;
				case('p1tail_left_down'):
				scope.mapcell='tail_turnLeft';
				rotate=180;
				break;
				case('p1tail_down_right'):
				scope.mapcell='tail_turnLeft';
				rotate=90;
				break;

				case('p1tailEnd_right'):
				scope.mapcell='tailEnd';
				rotate=0;
				break;
				case('p1tailEnd_down'):
				scope.mapcell='tailEnd';
				rotate=90;
				break;
				case('p1tailEnd_left'):
				scope.mapcell='tailEnd';
				rotate=180;
				break;
				case('p1tailEnd_up'):
				scope.mapcell='tailEnd';
				rotate=270;
				break;

			}
			element.css({
					'background-image': 'url(../img/'+scope.mapcell+'.png)',
					'transform':'rotate('+rotate+'deg)'
				});
		}
	};
})
.directive('gamehistory',function(){
	return{
		restrict:'EA',
		templateUrl:'../views/gamehistory.html'
	};
});
