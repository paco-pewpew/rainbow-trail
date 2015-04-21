(function() {
    'use strict';

    angular
        .module('rainbowTrail')
        .controller('HomeCtrl', HomeCtrl);

    /* @ngInject */
    function HomeCtrl($state,Socketio,userdata){
        var vm = this;
        vm.userdata=userdata;
        vm.findGame=findGame;
        vm.searchingForGame=false;

        ////////////////

        function findGame(){
        	delete vm.lastGameData;
			vm.searchingForGame=true;
			Socketio.emit('find game',{name:userdata.username});
        }


		Socketio.on('game start',function(msg){
			vm.searchingForGame=false;
			$state.go('game');
		});


    }
})();