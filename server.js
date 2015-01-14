'use strict';
var express=require('express');
var app=express();
var http=require('http').Server(app);
var io=require('socket.io')(http);



var port=process.env.PORT||1337;
var games=[];

app.use(express.static(__dirname+'/public'));

app.get('/',function(req,res){
	res.sendFile(__dirname+'public/index.html');
});



http.listen(port,function(){
	console.log('the awesomeness is on port'+port);
});