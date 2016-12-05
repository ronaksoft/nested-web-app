(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('userDetail', function($timeout) {
      return {
        template: function(element) {
          var tag = element[0].nodeName;
          return '<' + tag +' ng-transclude ng-mouseenter="openPop = true" data-popover-class="white-pop popover-userdetail" uib-popover-template="\'app/components/user/user-detail.html\'" data-popover-append-to-body="false" data-popover-placement="top-center auto" data-popover-is-open="openPop" ></' + tag +'>';
        },
        restrict: 'EA',
        replace: true,
        transclude: true,
        controller: 'UserDetailCtrl',
        controllerAs: 'ctlUserDetail',
        bindToController: {
          user: '@'
        }
      }
    });
})();
