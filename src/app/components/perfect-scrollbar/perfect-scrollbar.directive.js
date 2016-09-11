(function() {
  'use strict';
  var app = angular.module('nested');
  // app.config(function ($provider) {
  //   var defaultSettings = {
  //
  //   };
  //   $provider.value('perfectScrollbarSettings', defaultSettings);
  //
  // });

  app.directive('perfectScrollbar', perfectScrollbar);

  function perfectScrollbar($window) {
    return {
      restrict : 'A',
      // scope : {
      //   onReachBottom : '=',
      //   onReachTop : '=',
      //   onReachRight : '=',
      //   onReachLeft : '=',
      //   onHorizontalMove : '=',
      //   onVerticalMove : '='
      // },
      link: link
    };

    function link($scope, $element, $attrs) {
      var container = $element[0];
      $element.css('position', 'relative');
      if (container) {
        Ps.initialize(container, {
          wheelSpeed : 1,
          minScrollbarLength : 16
        });
      }

      // // if (_.isFunction($scope.onReachBottom)) {
      //   $window.addEventListener('ps-y-reach-end', function (event) {
      //   });
      // // }

      $scope.$on('$destroy', function () {
        Ps.destroy(container);
      });

    }
  }

})();
