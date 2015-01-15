'use strict';
var express=require('express');
var app=express();
var http=require('http').Server(app);
var io=require('socket.io')(http);

var mapScheme=require('./config/map.js');

var port=process.env.PORT||1337;
var games=[];
app.use(express.static(__dirname+'/public'));

app.get('/',function(req,res){
	res.sendFile(__dirname+'public/index.html');
});

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
			//save old position
			var p1Old=[game.gameData.player1.position[0],game.gameData.player1.position[1]];
			var p2Old=[game.gameData.player2.position[0],game.gameData.player2.position[1]];
			//update positions for now only testing with 1 player
			updatePosition(game.gameData.player1.position,game.gameData.player1.turn);
			//updatePosition(game.gameData.player2.position,game.gameData.player2.turn);
			//update map
			updateMap(game,game.gameData.mapStart,p1Old,p2Old,game.gameData.player1.position,game.gameData.player2.position);
		}
	});
}
main();

function updatePosition(positions,turn){
	switch(turn){
		case('right'): positions[1]+=1;break;
		case('left'): positions[1]-=1;break;
		case('top'): positions[0]-=1;break;
		case('bottom'):positions[0]+=1;break;
	}
}
function updateMap(game,map,p1Old,p2Old,p1,p2){
	switch(map[p1[0]][p1[1]]){
		case(1):
		//stops the game
		//remove game from games array and iterator
		games=games.filter(function(el){
			if(el.name===game.name){
				//probably should leave room lol?
				return false;
			}else{
				return true;
			}
		});
		io.to(game.name)
			.emit('game stop',{msg:'player1 has crashed',data:game});
		break;
		case(2):
		//adds bonus bonus
		game.gameData.player1.points+=1;
		case(0):
		//normal case
		map[p1Old[0]][p1Old[1]]=0;
		map[p1[0]][p1[1]]='p1';
	}

	/*
	map[p1Old[0]][p1Old[1]]=0;
	map[p2Old[0]][p2Old[1]]=0;
	map[p1[0]][p1[1]]='p1';
	map[p2[0]][p2[1]]='p2';*/

	//send to player1s room:
	io.to(game.name)
		.emit('game update',{msg:'update the game state',data:game});
}

io.on('connection',function(socket){
	var nameOnSocket;
	var gameOnSocket;
	console.log('new user have entered');

	socket.on('find game',function(msg){
		console.log(msg.name+ ' wants to join a game');
		nameOnSocket=msg.name;
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
					position:[0,0],
					turn:'right',
					points:0
				},
				player2:{
					name:games[games.length-1].players[1],
					position:[11,11],
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
				console.log(game.gameData['player'+(p+1)]);
				game.gameData['player'+(p+1)].turn=direction;
			}

		});
		console.log(direction);
		console.log(gameOnSocket);
	});

	socket.on('disconnect',function(){
		console.log(nameOnSocket+'has left');
		//remove game
		games=games.filter(function(el,id,array){
			if(el.players.indexOf(nameOnSocket)>-1){
				//probably should leave room lol?
				socket.leave(gameOnSocket);
				return false;
			}else{
				return true;
			}
		});
		console.log(games);
	});
	
});

http.listen(port,function(){
	console.log('the awesomeness is on port'+port);
});