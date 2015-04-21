(function() {
    'use strict';

    angular
        .module('rainbowTrail')
        .factory('Socketio', socketio);

    /* @ngInject */
    function socketio($rootScope) {
        var socket=io.connect();
        var service = {
            on: on,
            emit:emit
        };
        return service;

        ////////////////

        function on(eventName, callback) {
        	//remove old listener if needed- no more multiple emits
            //console.log(Object.keys(socket._callbacks.indexOf(eventName)));
    		if(socket.hasListeners(eventName)){
    			socket.removeEventListener(eventName);
    		}
    		socket.on(eventName,function(){
    			var args=arguments;
    			$rootScope.$apply(function(){
    				callback.apply(socket,args);
    			});
    		});
	    }

	    function emit(eventName, data, callback) {
	      socket.emit(eventName, data, function () {
	        var args = arguments;
	        $rootScope.$apply(function () {
	          if (callback) {
	            callback.apply(socket, args);
	          }
	        });
	      });
	    }

    }
})();