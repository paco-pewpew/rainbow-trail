'use strict';
angular.module('Directives',[])
	.directive('gamestick',function(){
		return{
			restrict:'EA',
			link:function(scope,element,attrs){
				attrs.$observe('turn',function(value){
					element.css({
					'background-image': 'url(../img/gameStick_'+value+'.png)',
					//'background-size':'100px 100px',
					'background-size':'100% 100%',
					'background-repeat':'no-repeat',
					'border':'3px ridge #c3c3c3',
					'border-radius':'50%',
					'height':'100px',
					'padding':'0px'
					});
				});
			}
		};
	})
.directive('gamecell',function(){
	return{
		restrict:'EA',
		scope:{mapcell:'@'},
		link:function(scope,element,attrs){
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
					'background-image': 'url(../img/'+scope.mapcell+'.png)',
					'transform':'rotate('+rotate+'deg)'
				});
		}
	};
})
.directive('gamehistory',function(){
	return{
		restrict:'EA',
		templateUrl:'../views/gamehistory.html',
	};
});