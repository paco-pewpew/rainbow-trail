(function() {
    'use strict';

    angular
        .module('rainbowTrail')
        .factory('Preloader', Preloader);

    /* @ngInject */
    function Preloader($q) {
    	function PreloaderC(locations){
			this.locations=locations;
			this.itemCount=locations.length;
			this.loadCount=0;
			this.deferred=$q.defer();
			this.promise=this.deferred.promise;
		}
		PreloaderC.prototype.load=function(){
			for(var i=0;i<this.itemCount;i++){
				this.loadLocation(this.locations[i]);
			}
			return this.promise;
		};
		PreloaderC.prototype.loadLocation=function(location){
			var preloader=this;
			var image=new Image();
			image.src=location;
			image.addEventListener('load',function(){
				preloader.loadCount++;
				preloader.deferred.notify({
					percent:Math.ceil(preloader.loadCount/preloader.itemCount*100)
				});

				if(preloader.loadCount===preloader.itemCount){
					preloader.deferred.resolve();
				}
			});
			image.addEventListener('error',function(){
				preloader.deferred.reject(location);
			});
		};

		return (PreloaderC);

    }
})();