(function() {
    'use strict';

    angular
        .module('rainbowTrail')
        .directive('gameCell', gameCell);

    /* @ngInject */
    function gameCell () {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            link: link,
            restrict: 'E',
            scope: {
            	mapcell:'@'
            }
        };
        return directive;

        function link(scope, element, attrs) {
        	var rotate=0;
			switch(scope.mapcell){
				case('tail_right_right'):
				scope.mapcell='tail_forward';
				rotate=0;
				break;
				case('tail_down_down'):
				scope.mapcell='tail_forward';
				rotate=90;
				break;
				case('tail_left_left'):
				scope.mapcell='tail_forward';
				rotate=180;
				break;
				case('tail_up_up'):
				scope.mapcell='tail_forward';
				rotate=270;
				break;

				case('tail_right_down'):
				scope.mapcell='tail_turnRight';
				rotate=0;
				break;
				case('tail_down_left'):
				scope.mapcell='tail_turnRight';
				rotate=90;
				break;
				case('tail_left_up'):
				scope.mapcell='tail_turnRight';
				rotate=180;
				break;
				case('tail_up_right'):
				scope.mapcell='tail_turnRight';
				rotate=270;
				break;

				case('tail_right_up'):
				scope.mapcell='tail_turnLeft';
				rotate=0;
				break;
				case('tail_up_left'):
				scope.mapcell='tail_turnLeft';
				rotate=270;
				break;
				case('tail_left_down'):
				scope.mapcell='tail_turnLeft';
				rotate=180;
				break;
				case('tail_down_right'):
				scope.mapcell='tail_turnLeft';
				rotate=90;
				break;

				case('tailEnd_right'):
				scope.mapcell='tailEnd';
				rotate=0;
				break;
				case('tailEnd_down'):
				scope.mapcell='tailEnd';
				rotate=90;
				break;
				case('tailEnd_left'):
				scope.mapcell='tailEnd';
				rotate=180;
				break;
				case('tailEnd_up'):
				scope.mapcell='tailEnd';
				rotate=270;
				break;

			}
			element.css({
				'background-image': 'url(assets/img/'+scope.mapcell+'.png)',
				'transform':'rotate('+rotate+'deg)'
			});
        }
    }

})();