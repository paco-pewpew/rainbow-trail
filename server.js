'use strict';
var express=require('express');
var app=express();
var http=require('http').Server(app);
var io=require('socket.io')(http);
var port=process.env.PORT||1337;

app.use(express.static(__dirname+'/public'));

require('./app/GameLogic.js')(io);


app.get('*',function(req,res){
	res.sendFile(__dirname+'public/index.html');
});

http.listen(port,function(){
	console.log('the awesomeness is on port'+port);
});