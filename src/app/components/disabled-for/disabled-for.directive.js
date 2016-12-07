(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('nstDisableForBtn', function () {
      return {
        restrict: 'AE',
        replace : true,
        //template: '<button id="call" data-ng-disabled="disabled" ng-click="onClick()" class="btn" >{{text}}</button>',
        template: '<input type="button" id="call" data-ng-disabled="disabled" ng-click="onClick()" class="btn" value="{{text}}">',
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
                  vm.text = "Call " + "( Wait " + minutes + ":" + seconds + ")";
                }else{
                  vm.text = "Call " + "( Wait " + minutes + ":" + "0" + seconds + ")";
                }
              }else{
                vm.text = "Call " + "( Wait " + seconds + ")";
              }
            }else{
              if(inSeconds > 1){
                inSeconds = inSeconds - 1;
                if(inSeconds.toString().length > 1){
                 vm.text = "Resend " + "( Wait " + inSeconds + ")";
                }else{
                  vm.text = "Resend " + "( Wait " + "0" + inSeconds + ")";
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
