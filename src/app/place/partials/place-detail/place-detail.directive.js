(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('placeDetail', function($timeout,$state,NstSearchQuery,NstSvcAuth,NST_PATTERN,NstSvcPlaceFactory, $, _) {
      return {
        template: function(element) {
          var tag = element[0].nodeName;
          return '<' + tag +' ng-transclude ng-mouseenter="openOverEnable()" ng-mouseleave="openOverdisable()" data-popover-is-open="openOver()" data-popover-enable="isAvailable" data-popover-class="white-pop popover-placedetail hide-on-scroll" uib-popover-template="\'app/place/partials/place-detail/place-detail.html\'" data-popover-append-to-body="true" data-popover-placement="top-center auto" ng-click="viewContact()"></' + tag +'>';
        },
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
          placeId: '=placeDetail'
        },
        link: function ($scope) {
          (function(){
            if ( _.isString($scope.placeId) ) {
              $scope.isEmail = NST_PATTERN.EMAIL.test($scope.placeId);
              if (!$scope.isEmail) {
                NstSvcPlaceFactory.get($scope.placeId).then(function (place) {
                  $scope.place = place;
                })
              } else {
                $scope.place = {
                  id : $scope.placeId,
                  name : $scope.placeId,
                  fullName : $scope.placeId
                }
              }
            } else {
              $scope.place = $scope.placeId;
            }
          })();

          // All subplaces of person shoould not available
          $scope.isAvailable = true ;

          $scope.openOver = function () {
            return false
          };



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
              var $element2 = $('.popover-placedetail');

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
            if($('.popover-placedetail').length > 1){

              for(var i=0; i < $('.popover-placedetail').length - 1;i++) {
                $('.popover-placedetail')[i].parentNode.removeChild($('.popover-placedetail')[i]);
              }

            }
          };

          $scope.deletePopoversAll = function () {
            //close all popover
            if($('.popover-placedetail').length > 0){

              for(var i=0; i < $('.popover-placedetail').length;i++) {
                $('.popover-placedetail')[i].parentNode.removeChild($('.popover-placedetail')[i]);
              }

            }
          };

          $scope.messagePlace = function ($event) {
            $scope.deletePopoversAll();
            $event.preventDefault();
            $state.go('app.place-compose', {placeId: $scope.placeId}, {notify: false});
          }

          $scope.copy = function () {
            copyToClipboard($scope.place.id);
          }

          function copyToClipboard(text) {
            var inp = document.createElement('input');
            document.body.appendChild(inp);
            inp.value = text;
            inp.select();
            document.execCommand('copy', false);
            inp.remove();
          }
          $scope.viewContact = function () {
            if ($scope.isAvailable) {
              $timeout.cancel($scope.timer);
              $timeout.cancel($scope.timer2);
              $timeout.cancel($scope.timer3);
              $scope.deletePopoversAll();
            }
          }
        }
      }
    });
})();
