'use strict';
//0-empty
//1-wall
//2-bonus

var height=10;
var width=10;

module.exports={
	//new map every game!
	map:function(){
		var map=[];
		for(var i=0;i<width;i++){
			map[i]=new Array(height);
			for(var j=0;j<height;j++){
				var god=Math.random();
				if(god<0.1 &&
				//we don't want any walls near border for instant GG 
					!(i===0 && (j===0 ||j==1)) && !(i===1 && (j===0||j===1)) && 
					!(i===height &&(j===width||j===width-1)) && !(i===(height-1) &&(j===width||j===width-1))
					){
					map[i][j]=1;
				}else if(god<0.2){
					map[i][j]=2;
				}else{
					map[i][j]=0;
				}
			}
		}
		return map;
	},
	height:height,
	width:width
};