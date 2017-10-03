(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('userDetail', function($timeout,$state,NstSearchQuery,NstSvcAuth,NST_PATTERN, $, NstSvcUserFactory, _) {
      return {
        template: function(element) {
          var tag = element[0].nodeName;
          return '<' + tag +' ng-transclude ng-mouseenter="openOverEnable()" ng-mouseleave="openOverdisable()" data-popover-is-open="openOver()" data-popover-enable="isAvailable" data-popover-class="white-pop popover-userdetail hide-on-scroll" uib-popover-template="\'app/components/user/user-detail.html\'" data-popover-append-to-body="true" data-popover-placement="top-center auto" ng-click="viewContact();$event.stopPropagation()"></' + tag +'>';
        },
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
          userDetail: '=userDetail'
        },
        link: function ($scope, $element) {

          if ( _.isString($scope.userDetail) ) {
            NstSvcUserFactory.get($scope.userDetail).then(function (user){
              $scope.user = user;
              init();
            });

          } else {
            $scope.user = $scope.userDetail ? $scope.userDetail : {};
            init();
          }


          $scope.openOver = function () {
            return false
          };

          function init() {
            $scope.isEmail = NST_PATTERN.EMAIL.test( $scope.user.id);
            $scope.isAvailable = NstSvcAuth.user && NstSvcAuth.user.id !== $scope.user.id;
            if ( $scope.isAvailable ) {
              $element.addClass('enabled-detail-popover');
            } else {
              $element.addClass('on-self-avatar');
            }
          }

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
            var query =  '@' + $scope.user.id;
            var searchQury = new NstSearchQuery(query);
            $state.go('app.search', { search : NstSearchQuery.encode(searchQury.toString()) });
          };

          $scope.messageUser = function ($event) {
            $scope.deletePopoversAll();
            $event.preventDefault();
            $state.go('app.place-compose', {placeId: $scope.user.id}, {notify : false});
          }

          $scope.viewContact = function () {
            if ($scope.isAvailable && !NST_PATTERN.EMAIL.test($scope.user.id)) {
              $timeout.cancel($scope.timer);
              $timeout.cancel($scope.timer2);
              $timeout.cancel($scope.timer3);
              $scope.deletePopoversAll();
              $state.go('app.contacts', { contactId: $scope.user.id }, { notify: false });
            }
          }
        }
      }
    });
})();
