'use strict';
angular.module('GameStickController',[])
	.controller('GameStickCtrl',['$scope','socketio','$window',function($scope,socketio,$window){

		$window.addEventListener('keydown', function(event) {
		  switch (event.keyCode) {
		    case 37: // Left
		      $scope.setTurn('left');
		    break;

		    case 38: // Up
		      $scope.setTurn('up');
		    break;

		    case 39: // Right
		      $scope.setTurn('right');
		    break;

		    case 40: // Down
		      $scope.setTurn('down');
		    break;
		  }
		}, false);
	}]);