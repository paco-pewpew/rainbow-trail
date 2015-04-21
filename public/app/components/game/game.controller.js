(function() {
    'use strict';

    angular
        .module('rainbowTrail')
        .controller('GameCtrl', GameCtrl);

    /* @ngInject */
    function GameCtrl($scope,$state,Socketio,userdata) {
        var vm = this;
        vm.username=userdata.username;
        vm.gameData='';
        vm.stopReason='';
        vm.returnHome=returnHome;
        
        ////////////////
        
        Socketio.on('game update',function(msg){
			vm.gameData=msg.data;
		});

		Socketio.on('game stop',function(msg){
			vm.gameData=msg.data;
			vm.stopReason=msg.msg;
			
            userdata.gamehistory.push({
				game:msg.data.name,
				winner:msg.data.gameData[msg.data.gameData.winner].name,
				opponent:msg.data.players[1-msg.data.players.indexOf(userdata.username)]
			});


		});

        function returnHome(){
            $state.go('home');
        }

    }
})();