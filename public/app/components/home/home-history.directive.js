(function() {
    'use strict';

    angular
        .module('rainbowTrail')
        .directive('history', history);

    /* @ngInject */
    function history() {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: Controller,
            controllerAs: 'vm',
            restrict: 'E',
            scope: {
                'historydata':'='
            },
            templateUrl:'app/components/home/home-history.view.html'
        };
        return directive;

    }

    /* @ngInject */
    function Controller () {
        var vm=this;

        vm.historySlider={
            current:0,
            next:function(){
                this.current+=1;
            },
            previous:function(){
                this.current-=1;
            }
        };
    }
})();