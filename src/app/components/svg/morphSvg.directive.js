(function() {
  'use strict';
  var app = angular.module('ronak.nested.web.components.sidebar');
  var defaultSettings = {};

  app.value('MorphSVG', defaultSettings);
  app.directive('morphSvg', svgmorphiling);

  function svgmorphiling($window, MorphSVG) {
    return {
      restrict : 'A',
      scope : {
        firstId : '=',
        secondId : '=',
        time : '=',
        equFun : '='
      },
      link: link
    };

    function link($scope, $element, $attrs) {

      var customSettings = {
        //wheelSpeed : readNumberValue($attrs.wheelSpeed),
        firstId : '"#'+ $attrs.firstId +'"',
        secondId : '"#'+ $attrs.secondId +'"',
        time : $attrs.time,
        equFun : '"'+ $attrs.equFun +'"'
      };

      var firstId = '"#'+ $attrs.firstId +'"',
        secondId = '"#'+ $attrs.secondId +'"',
        time = $scope.time,
        equFun = '"'+ $scope.equFun +'"';

      //comment out next line to disable findShapeIndex() UI
      //findShapeIndex("#square", secondId);



      var container = $element[0];
      var jContainer = $(container);
      var icon = $('#icons');



      jContainer.mouseenter(function () {
        console.log($('#sq40'));
      });
      jContainer.mouseleave(function () {

      });

    }
  }

})();

