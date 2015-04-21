(function() {
    'use strict';

    angular
        .module('rainbowTrail')
        .directive('gameStick', gameStick);

    /* @ngInject */
    function gameStick () {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: GameStickController,
            controllerAs: 'vm',
            link: link,
            restrict: 'E',
            scope: {
            },
            templateUrl:'app/components/game/game-stick.view.html'
        };
        return directive;

        function link(scope, element, attrs) {
        	scope.$watch('vm.direction',function(value){
				element.css({
				'background-image': 'url(assets/img/gameStick_'+value+'.png)',
				});
			});
        }
    }

    /* @ngInject */
    function GameStickController ($window,Socketio) {
    	var vm=this;
        vm.direction='idle';
        vm.setDirection=setDirection;
        ////////////////

        function setDirection(direction){
            if((['up','down'].indexOf(vm.direction)>=0 && ['up','down'].indexOf(direction)>=0)||
                (['left','right'].indexOf(vm.direction)>=0 && ['left','right'].indexOf(direction)>=0)){
                //shouldn't go reverse - up from down and left from right 
            }else{
                vm.direction=direction;
                Socketio.emit('change direction',direction);
            }
        }

        $window.addEventListener('keydown', function(event) {
		  switch (event.keyCode) {
		    case 37: // Left
		      vm.setDirection('left');
		    break;

		    case 38: // Up
		      vm.setDirection('up');
		    break;

		    case 39: // Right
		      vm.setDirection('right');
		    break;

		    case 40: // Down
		      vm.setDirection('down');
		    break;
		  }
		}, false);
    }
})();