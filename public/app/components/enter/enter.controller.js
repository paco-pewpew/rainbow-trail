(function() {
    'use strict';

    angular
        .module('rainbowTrail')
        .controller('EnterCtrl', EnterCtrl);

    /* @ngInject */
    function EnterCtrl($state,Socketio,Preloader,userdata,allImages) {
        var vm = this;
        var imgResources=new Preloader(allImages);
        vm.username='';
        vm.setName=setName;
        vm.resourcesPercentage=0;
        vm.errors={
        	name:false,
        	resources:false,
        };

        ////////////////

        function setName(){
			//sends username=>server will respond with 'set name'
			Socketio.emit('get name',{name:vm.username});
		}

        Socketio.on('set name',function(msg){
			if(msg.free==='no'){
				vm.errors.name=true;
			}else{
				vm.errors.name=false;
				//set global val username
				userdata.username=vm.username;
				
				imgResources.load().then(
					function handleResolve(){
						$state.go('home');
					},function handleReject(){
						vm.errors.resources=true;
					},function handleNotify(event){
						vm.resourcesPercentage=event.percent;
					});
			}
		});

    }
})();