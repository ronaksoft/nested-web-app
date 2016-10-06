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
      console.log('hello',$element,$attrs.firstId);

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
      var jContainers = $('#icons');

      var tl = new TimelineLite(),
        circle = document.getElementById("circle"),
        first = document.getElementById($attrs.firstId),
        second = document.getElementById($attrs.secondId);

      // tl.to(circle, 1, {morphSVG:"#hippo"}, "+=1")
      //   .to(circle, 1, {morphSVG:"#star"}, "+=1")
      //   .to(circle, 1, {morphSVG:"#elephant"}, "+=1")
      //   .to(circle, 1, {morphSVG:circle}, "+=1");

      jContainer.mouseenter(function () {
        console.log(jContainers,first);
        TweenLite.to(first, 1, {morphSVG:{shape:second, shapeIndex:1}});
      });
      jContainer.mouseleave(function () {
        TweenLite.to(second, 1, {morphSVG:{shape:first, shapeIndex:1}});
      })

    }
  }

})();
