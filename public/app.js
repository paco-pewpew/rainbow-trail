'use strict';
angular.module('rainbowTrail',['SocketService','UtilityServices','Directives','GameStickController'])
	.controller('GameCtrl',['$scope','$window','socketio','loader','allImages',
		function($scope,$window,socketio,loader,allImages){
		$scope.username;
		$scope.isLogged=false;
		$scope.inGame=false;
		$scope.searchingForGame=false;
		$scope.turn='idle';
		$scope.gameHistory=[];
		$scope.history={
			current:0,
			next:function(){
				this.current+=1;
			},
			previous:function(){
				this.current-=1;
			}
		};


		$scope.imageLocations=allImages;
		var preloader=new loader($scope.imageLocations);


		$scope.setTurn=function(way){
			if((['up','down'].indexOf($scope.turn)>=0 && ['up','down'].indexOf(way)>=0)||(['left','right'].indexOf($scope.turn)>=0 && ['left','right'].indexOf(way)>=0)){
				//shouldn't go reverse - up from down and left from right 
			}else{
				$scope.turn=way;
				socketio.emit('change direction',way);
			}
		};

		$scope.setName=function(){
			//sends username=>server will respond with 'set name'
			socketio.emit('get name',{name:$scope.username});
		};

		socketio.on('set name',function(msg){
			//if taken=>show err msg, if free- logs with this name
			if(msg.free==='no'){
				$scope.errorSetName='there is already a user with the same name';
			}else{
				preloader.load().then(
					function handleResolve(){
						console.log('loading successful');
						$scope.isLogged=true;
					},function handleReject(){
						console.log('loading error');
					},function handleNotify(event){
						$scope.percentLoaded=event.percent;
						console.log('Percentage loaded ',event.percent);
					});
			}
		});
		
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
			$scope.turn='idle';
			$scope.gameData=msg.data;
			$scope.stopReason=msg.msg;
			$scope.inGame=false;
			$scope.gameHistory.unshift({
				game:msg.data.name,
				winner:msg.data.gameData[msg.data.gameData.winner].name,
				opponent:msg.data.players[1-msg.data.players.indexOf($scope.username)]
			});

			console.log(msg);
			console.log($scope.gameHistory);
		});
	
	}])

;
