(function () {
  'use strict';

  angular
    .module('nested')
    .directive('nstDisableForBtn', function () {
      return {
        restrict: 'AE',
        replace : true,
        template: '<button id="call" data-ng-disabled="disabled" ng-click="onClick()" class="btn" >{{text}}</button>',
        scope: {
          min: '=',
          sec: '=',
          click : '&',
          orginalText: '@value'
        },
        controller: 'nstDisableForBtnCrtl',
      };
    })
    .controller('nstDisableForBtnCrtl', function($scope, $interval){
      
      var vm = $scope;
      
      vm.min = parseInt($scope.min);
      vm.sec = parseInt($scope.sec);
      vm.orginalText = $scope.orginalText;
      vm.click = $scope.click;

      
        var i = [],
        play = [];

        function start(){
          var inSeconds = vm.min * 60 + vm.sec;

          vm.disabled = true;

          play = $interval(function() {
            if(inSeconds > 60){
              inSeconds = inSeconds - 1;
              var minutes = Math.floor(inSeconds / 60);
              var seconds = inSeconds % 60;
              if(minutes >= 1){
                if(seconds.toString().length > 1){
                  vm.text = minutes + ":" + seconds + " minutes left to " + $scope.orginalText;
                }else{
                  vm.text = minutes + ":" + "0" + seconds + " minutes left to " + $scope.orginalText;
                }
              }else{
                vm.text = seconds + " seconds left to " + $scope.orginalText;
              }
            }else{
              if(inSeconds > 1){
                inSeconds = inSeconds - 1;
                if(inSeconds.toString().length > 1){
                 vm.text = inSeconds + " seconds left to " + $scope.orginalText;
                }else{
                  vm.text = "0" + inSeconds + " seconds left to " + $scope.orginalText;
                }
              }else{
                vm.disabled = false;

                $interval.cancel(play);
                vm.text = vm.orginalText;

              }
            }
          }, 1000);
        }
    
        vm.onClick = function(){
          vm.click();
          start();
        }
        start();


    });
})();
