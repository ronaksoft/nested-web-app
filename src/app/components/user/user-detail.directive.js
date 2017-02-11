(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('userDetail', function($timeout,$state,NstSearchQuery,NstSvcAuth,NST_PATTERN, NstSvcStore) {
      return {
        template: function(element) {
          var tag = element[0].nodeName;
          return '<' + tag +' ng-transclude ng-mouseenter="openOverEnable()" ng-mouseleave="openOverdisable()" data-popover-is-open="openOver()" data-popover-enable="available()" data-popover-class="white-pop popover-userdetail" uib-popover-template="\'app/components/user/user-detail.html\'" data-popover-append-to-body="true" data-popover-placement="top-center auto" ng-click="$event.stopPropagation()"></' + tag +'>';
        },
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {},
        //controller: 'UserDetailCtrl',
        //controllerAs: 'ctlUserDetail',
        // bindToController: {
        //   user: '@'
        // },
        link: function ($scope, $element, $attrs) {
          $scope.available = function () {

            return true
          };
          var vm = this;
          $scope.user = JSON.parse($attrs.user);
          $scope.avatar = $scope.user.avatar128 || ($scope.user.picture && $scope.user.picture.x128 ? NstSvcStore.getViewUrl($scope.user.picture.x128) : '');
          $scope.username = $scope.user.username || $scope.user.id;
          $scope.name = $scope.user.name || $scope.user.firstName;


          $scope.isEmail = NST_PATTERN.EMAIL.test($scope.username);






          $scope.openOver = function () {
            return false
          };

          if(NstSvcAuth.user.id == $scope.username) {
            $scope.available = function () {

              return false
            };
            return $scope.available;
          }

          $element.addClass('on-avatar');


          $scope.openOverEnable = function () {

            $scope.deletePopovers();

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

          $scope.getUserName = function () {
            return $scope.username
          };

          $scope.deletePopovers = function () {
            //close previous popover
            if($('.popover-userdetail').length > 1){

              for(var i=0; i < $('.popover-userdetail').length - 1;i++) {
                $('.popover-userdetail')[i].parentNode.removeChild($('.popover-userdetail')[i]);
              }

            }
          };

          $scope.deletePopoversAll = function () {
            //close all popover
            if($('.popover-userdetail').length > 0){

              for(var i=0; i < $('.popover-userdetail').length;i++) {
                $('.popover-userdetail')[i].parentNode.removeChild($('.popover-userdetail')[i]);
              }

            }
          };

          $scope.searchUser = function () {
            $scope.deletePopoversAll();
            var query =  '@' + $scope.username;
            var searchQury = new NstSearchQuery(query);
            $state.go('app.search', { search : NstSearchQuery.encode(searchQury.toString()) });
          };

          $scope.messageUser = function ($event) {
            $scope.deletePopoversAll();
            $event.preventDefault();
            $state.go('app.place-compose', {placeId: $scope.username}, {notify : false});
          }

        }
      }
    });
})();
