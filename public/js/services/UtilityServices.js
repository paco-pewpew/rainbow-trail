'use strict';
angular.module('UtilityServices',[])
	.factory('loader',['$q',function($q){

		function Preloader(locations){
			this.locations=locations;
			this.itemCount=locations.length;
			this.loadCount=0;
			this.deferred=$q.defer();
			this.promise=this.deferred.promise;
		}
		Preloader.prototype.load=function(){
			for(var i=0;i<this.itemCount;i++){
				this.loadLocation(this.locations[i]);
			}
			return this.promise;
		};
		Preloader.prototype.loadLocation=function(location){
			var that=this;
			var image=new Image();
			image.src=location;
			image.addEventListener('load',function(){
				that.loadCount++;
				that.deferred.notify({
					percent:Math.ceil(that.loadCount/that.itemCount*100)
				});

				if(that.loadCount===that.itemCount){
					that.deferred.resolve();
				}
			});
			image.addEventListener('error',function(){
				that.deferred.reject(location);
			});
		};

		return Preloader;

	}])

	.value('allImages',['img/tailEnd.png',
								'img/tail_turnRight.png',
								'img/tail_turnLeft.png',
								'img/tail_forward.png',
								'img/p2up.png',
								'img/p2right.png',
								'img/p2left.png',
								'img/p2down.png',
								'img/p2.png',
								'img/p1up.png',
								'img/p1right.png',
								'img/p1left.png',
								'img/p1down.png',
								'img/p1.png',
								'img/loading.png',
								'img/home.png',
								'img/gameStick_up.png',
								'img/gameStick_right.png',
								'img/gameStick_left.png',
								'img/gameStick_idle.png',
								'img/gameStick_down.png']
								);