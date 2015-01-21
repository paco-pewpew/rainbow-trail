'use strict';
var mapScheme=require('../config/map.js');


module.exports=function(io){

var games=[];
var users=[];

var lastTime;
function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;
    updateGames(dt);
    lastTime = now;
    setTimeout(main,1000/1);
}
function updateGames(dt){
	games.forEach(function(game){
		//if there are 2 players then we playing
		if(game.playersNumber===2){
			updateMap(game,game.gameData.mapStart);
		}
	});
}
main();

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
				//probably should leave room lol?
				return false;
			}else{
				return true;
			}
		});
		console.log('stopping game'+game.name);
		io.to(game.name)
			.emit('game stop',{msg:reason,data:game});
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
	

	
	[head1,head2].forEach(function(head,id,array){
		console.log('checking player'+(id+1));
		console.log(head);
		//check if target is out of bounds
		if(head[0]<0||head[0]>mapScheme.width-1||head[1]<0||head[1]>mapScheme.heigth-1){
			stopGame(game,'player'+(2-id),'player'+(id+1)+' out of bounds');
			return;
		}
		//eat its tail lololel.slice(1,el.length).indexOf(el);
		var playerObject=game.gameData['player'+(id+1)].position;
		var sameAsHead=playerObject.map(function(bPart){
			return [bPart[0],bPart[1]].toString();
		}).indexOf([playerObject[0][0],playerObject[0][1]].toString(),1);
		if(sameAsHead>-1){
			console.log('need to delete'+(playerObject.length-sameAsHead)+'elements');
			playerObject.splice(sameAsHead,playerObject.length-sameAsHead).forEach(function(el){
				//the eaten elements are conveted to plain fields aka 0
				map[el[0]][el[1]]=0;
				//points are removed
				game.gameData['player'+(id+1)].points-=1;
			});
		}
		//check collision with static map objects
		switch(map[head[0]][head[1]]){
			case(1):
			//hit wall
			//stops the game
			stopGame(game,'player'+(2-id),'player'+(id+1)+' has crashed');
			break;
			case(0):
			//normal case
			//removes last cuz head was created
			var last=game.gameData['player'+(id+1)].position.pop();
			map[last[0]][last[1]]=0;
			//removes point and coontinue with things from case2 cuz its the same
			game.gameData['player'+(id+1)].points-=1;
			case(2):
			//adds bonus bonus
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
			break;
			default:
			//all thats is left unchecked is parts of the tail of the other player
			//die when hit other players tail or eat it??? ...TRON style
			if(/tail/.test(map[head[0]][head[1]])){
				stopGame(game,'player'+(2-id),'player'+(id+1)+' recieved a rainbow burn');
			}else{
				//horn battle
				if(game.gameData.player1.points>=game.gameData.player2.points){
					stopGame(game,'player1','trial by horn combat');
				}else{
					stopGame(game,'player2','trial by horn combat');
				}		
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
		console.log('new user have entered');

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
			console.log(msg.name+ ' wants to join a game');
			if(!games[games.length-1]||(games[games.length-1].playersNumber===2)){
				//creates new game
				games[games.length]={name:(msg.name+'s game'),playersNumber:1,players:[msg.name]};
				console.log(games);
				gameOnSocket=msg.name+'s game';
				socket.join(msg.name+'s game');
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
				console.log(games);
				gameOnSocket=games[games.length-1].players[0]+'s game';
				socket.join(games[games.length-1].players[0]+'s game');
				io.to(games[games.length-1].players[0]+'s game')
					.emit('game start',{msg:'game is going to start',data:games[games.length-1]});
			}
		});

		socket.on('change direction',function(direction){
			//finds game which the socket is playing on then finds if he is p1 or p2 then changes his turn ala direction
			games.forEach(function(game){
				//finds game
				if(game.name===gameOnSocket){
					var p=game.players.indexOf(nameOnSocket); //0- player1 or 1-player2
					game.gameData['player'+(p+1)].turn=direction;
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