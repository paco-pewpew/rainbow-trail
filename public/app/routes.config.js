(function() {
    'use strict';

    angular
        .module('rainbowTrail')
        .config(config)
        .run(run);

    /* @ngInject */
    function config($stateProvider,$urlRouterProvider) {
    	$stateProvider
    		.state('enter',{
    			url:'/enter',
                controller:'EnterCtrl',
                controllerAs:'vm',
    			templateUrl:'app/components/enter/enter.view.html',
    		})
    		.state('home',{
    			url:'/home',
                resolve:{
                    'resSigned':resolveSigned
                },
                controller:'HomeCtrl',
                controllerAs:'vm',
    			templateUrl:'app/components/home/home.view.html'
    		})
    		.state('game',{
    			url:'/game',
                resolve:{
                    'resSigned':resolveSigned
                },
                controller:'GameCtrl',
                controllerAs:'vm',
    			templateUrl:'app/components/game/game.view.html'
    		});

        //$urlRouterProvider.when('/account/signup','/account/signup/local');
        $urlRouterProvider.otherwise('/enter');
    

        /* @ngInject */
        function resolveSigned($q,userdata){
            return $q(function(resolve,reject){
                if(userdata.username){
                    resolve('has access');
                }else{
                    reject('no access');
                }
            });
        }
    }


    /* @ngInject */
    function run($rootScope,$state){
        $rootScope.$on('$stateChangeError',function(event, toState, toParams, fromState, fromParams, error){
            event.preventDefault();
            console.log(error);
            $state.go('enter');
        });
    }
})();