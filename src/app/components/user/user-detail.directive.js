(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('userDetail', function($timeout,$state,NstSearchQuery) {
      return {
        template: function(element) {
          var tag = element[0].nodeName;
          return '<' + tag +' ng-transclude ng-mouseenter="openOverEnable()" ng-mouseleave="openOverdisable()" data-popover-is-open="openOver()" data-popover-class="white-pop popover-userdetail" uib-popover-template="\'app/components/user/user-detail.html\'" data-popover-append-to-body="true" data-popover-placement="top-center auto"></' + tag +'>';
        },
        restrict: 'EA',
        replace: true,
        transclude: true,
        //controller: 'UserDetailCtrl',
        //controllerAs: 'ctlUserDetail',
        // bindToController: {
        //   user: '@'
        // },
        link: function ($scope, $element, $attrs) {




          $scope.openOver = function () {
            return false
          };

          $scope.openOverEnable = function () {

            //close previous popover
            if($('.popover-userdetail').length > 1){

              for(var i=0; i < $('.popover-userdetail').length - 1;i++) {
                $('.popover-userdetail')[i].parentNode.removeChild($('.popover-userdetail')[i]);
              }

            }

            //makes popover on mouse back
            //timer = leaving timer on element out
            $timeout.cancel($scope.timer);

            //timer = show popover timer
            $scope.timer = $timeout(function () {
              $scope.openOver = function () {
                return true
              };
            },1000);



            //hovering on popover
            $timeout(function () {
              var $element2 = $('.popover-userdetail');

              //timer2 = leaving timer on popover out
              $element2.mouseleave(function () {
                $scope.timer2 = $timeout(function () {
                  $scope.openOver = function () {
                    return false
                  }
                },500);
              });
              $element2.mouseenter(function () {
                $timeout.cancel($scope.timer3);
                $timeout.cancel($scope.timer2);
              })
            },1000);

          };

          //popover disable var
          $scope.openOverdisable = function () {
            $timeout.cancel($scope.timer);

            $scope.timer3 = $timeout(function () {
              $scope.openOver = function () {
                return false
              }
            },1000);

          };



          $scope.user = JSON.parse($attrs.user);
          $scope.avatar = $scope.user.avatar;
          $scope.username = $scope.user.username;
          $scope.name = $scope.user.name;

          $scope.getUserName = function () {
            return $scope.username
          };

          $scope.searchUser = function () {
            var query =  '@' + $scope.username;
            var searchQury = new NstSearchQuery(query);
            $state.go('app.search', { search : NstSearchQuery.encode(searchQury.toString()) });
          };

          $scope.messageUser = function () {
            $state.go('app.place-compose', {placeId: $scope.username});
          }

        }
      }
    });
})();
