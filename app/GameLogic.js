'use strict';
var mapScheme=require('../config/map.js');


module.exports=function(io){

var games=[];
var users=[];

var previousTick;
var cycle;

function gameLoop() {
	if(games.length>0){
		var now = Date.now();
	    var dt = (now - previousTick) / 1000.0;
	    //console.log(previousTick,now,dt);
	    updateGames(dt);

	    previousTick = now;
	  	cycle=setTimeout(gameLoop,1000/1);	
	}else{
		clearTimeout(cycle);		
	}	
}

function updateGames(dt){
	games.forEach(function(game){
		//if there are 2 players then we playing
		if(game.playersNumber===2){
			updateMap(game,game.gameData.mapStart);
		}
	});
}

function updatePosition(positions,turn){
	switch(turn){
		case('right'): positions[1]+=1;positions[2]='right';break;
		case('left'): positions[1]-=1;positions[2]='left';break;
		case('up'): positions[0]-=1;positions[2]='up';break;
		case('down'):positions[0]+=1;positions[2]='down';break;
	}
}

function stopGame(game,winner,reason){
	//set winner
	game.gameData.winner=winner;
	//remove game from games array and iterator
		games=games.filter(function(el){
			if(el.name===game.name){
				return false;
			}else{
				return true;
			}
		});
		//console.log('stopping game; Remaining games:',games);
		io.to(game.name)
			.emit('game stop',{msg:reason,data:game});
		
		//leave room


		//socketio patch May not work properly; loop connected sockets:
		var connectedS=io.of('/').connected;
		for(var s in connectedS){
			//if socket is in room
			if(connectedS[s].rooms.indexOf(game.name)!==-1){
				//attempt to leave room
				connectedS[s].leave(game.name);
			}
		}
		//stops loop if not active
		gameLoop();
		
}

function updateMap(game,map){
	//check if there are ANY bonuses left (if not game stops)
	var bonusesLeft=map.map(function(row){
		var test=row.some(function(criteria){
			return criteria===2;
		});
		return test;
	}).reduce(function(a,b){return a||b;});
	if(!bonusesLeft){
		//check who has more points
		if(game.gameData.player1.points>=game.gameData.player2.points){
			stopGame(game,'player1','no bonuses left');
		}else{
			stopGame(game,'player2','no bonuses left');
		}
		return;
	}

	game.gameData.player1.position.unshift([game.gameData.player1.position[0][0],game.gameData.player1.position[0][1]]);
	var head1=game.gameData.player1.position[0];
	updatePosition(head1,game.gameData.player1.turn);
	game.gameData.player2.position.unshift([game.gameData.player2.position[0][0],game.gameData.player2.position[0][1]]);
	var head2=game.gameData.player2.position[0];
	updatePosition(head2,game.gameData.player2.turn);
	

	//HEAD positions
	[head1,head2].every(function(head,id,array){
		
		//OUT OF BOUNDS
		if(head[0]<0||head[0]>mapScheme.width-1||head[1]<0||head[1]>mapScheme.height-1){
			stopGame(game,'player'+(2-id),'player'+(id+1)+' out of bounds');
			return false;
		}

		//OWN TAIL collision(eats part of the tail)
		var playerObject=game.gameData['player'+(id+1)].position;
		var sameAsHead=playerObject.map(function(bPart){
			return [bPart[0],bPart[1]].toString();
		}).indexOf([playerObject[0][0],playerObject[0][1]].toString(),1);
		if(sameAsHead>-1){
			playerObject.splice(sameAsHead,playerObject.length-sameAsHead).forEach(function(el){
				//the eaten elements are conveted to plain fields aka 0
				map[el[0]][el[1]]=0;
				//points are removed
				game.gameData['player'+(id+1)].points-=1;
			});
		}

		//CELL TYPE ON HEAD - nothing,bonus,wall,other player's head or tail
		if(map[head[0]][head[1]]===1){
			//WALL
			stopGame(game,'player'+(2-id),'player'+(id+1)+' has crashed');
			return false;
		}else if(map[head[0]][head[1]]===2||map[head[0]][head[1]]===0){
			//EMPTY or BONUS -safe place
			if(map[head[0]][head[1]]===0){
				var last=game.gameData['player'+(id+1)].position.pop();
				map[last[0]][last[1]]=0;
				game.gameData['player'+(id+1)].points-=1;	
			}
			//BONUS
			game.gameData['player'+(id+1)].points+=1;
			game.gameData['player'+(id+1)].position.forEach(function(bPart,i,arr){
				if(i===0){
					map[bPart[0]][bPart[1]]='p'+(id+1)+bPart[2];
				}else if(i===arr.length-1){
					map[bPart[0]][bPart[1]]='tailEnd_'+arr[i-1][2];
				}else{
					//tail from-to ex: right-down makes right turn
					map[bPart[0]][bPart[1]]='tail_'+bPart[2]+'_'+arr[i-1][2];
				}
			});
			return true;
		}else if(/tail/.test(map[head[0]][head[1]])){
			stopGame(game,'player'+(2-id),'player'+(id+1)+' recieved a rainbow burn');
		}else{
			//horn battle
			if(game.gameData.player1.points>=game.gameData.player2.points){
				stopGame(game,'player1','trial by horn combat');
				return false;

			}else{
				stopGame(game,'player2','trial by horn combat');
				return false;
			}		
		}

	});

	io.to(game.name)
		.emit('game update',{msg:'update the game state',data:game});
}

//require('./app/SocketManage.js')(io,games,users);
io.on('connection',function(socket){
		var nameOnSocket;
		var gameOnSocket;

		socket.on('get name',function(msg){
			if(users.indexOf(msg.name)>=0){
				io.to(socket.id).emit('set name',{free:'no',data:msg.name});	
			}else{
				users.push(msg.name);
				nameOnSocket=msg.name;
				io.to(socket.id).emit('set name',{free:'yes',data:msg.name});	
			}
		});

		socket.on('find game',function(msg){
			if(!games[games.length-1]||(games[games.length-1].playersNumber===2)){
				//creates new game
				var now=Date.now();
				gameOnSocket=msg.name+'s game'+now;
				games[games.length]={name:(gameOnSocket),playersNumber:1,players:[msg.name]};
				socket.join(gameOnSocket);
			}else{
				games[games.length-1].playersNumber=2;
				games[games.length-1].players.push(msg.name);
				games[games.length-1].gameData={
					mapStart:mapScheme.map(),
					player1:{
						name:games[games.length-1].players[0],
						position:[[0,0,'right']],
						turn:'right',
						points:0
					},
					player2:{
						name:games[games.length-1].players[1],
						position:[[mapScheme.width-1,mapScheme.height-1,'left']],
						turn:'left',
						points:0
					}
				};
				gameOnSocket=games[games.length-1].name;
				socket.join(gameOnSocket);

				//start loop if not active
				gameLoop();
				//start game;
				io.to(gameOnSocket)
					.emit('game start',{msg:'game is going to start',data:games[games.length-1]});
			}
		});

		socket.on('change direction',function(direction){
			//finds game which the socket is playing on then finds if he is p1 or p2 then changes his turn ala direction
			games.forEach(function(game){
				//finds game
				try{
					if(game.name===gameOnSocket){
						var p=game.players.indexOf(nameOnSocket); //0- player1 or 1-player2
						game.gameData['player'+(p+1)].turn=direction;
					}
				}catch(err){
					//key turn may fire after game is done or smth like that
					//console.log('error trying to turn',err);
				}

			});
		});

		socket.on('disconnect',function(){
			//remove name from user lists so it can be used again
			users.splice(users.indexOf(nameOnSocket),1);
			//stops and remove the game from games list
			games=games.filter(function(game){
				if(game.players.indexOf(nameOnSocket)>-1){
					//if game has started(2 playrs then use the function to set winner)
					if(game.playersNumber===2){
						stopGame(game,'player'+(2-game.players.indexOf(nameOnSocket)),nameOnSocket+' has left the game');
					}
					socket.leave(gameOnSocket);
					return false;
				}else{
					return true;
				}
			});
		});
		
	});

};