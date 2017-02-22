(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('affixPost', onScroll);

  /** @ngInject */
  function onScroll($window,$rootScope,deviceDetector,$timeout,SvcCardCtrlAffix) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {


        //console.log(el,$element.parent().children().first().height(),$element.parent().children().first()[0].scrollHeight);
        $timeout(function () {
          var el = {
            el : $element,
            topOff : $element.parent().offset().top,
            cardH : $element.parent().children().first().height(),
            leftOff : $element.parent().offset().left,
            fixed : false
          };
          SvcCardCtrlAffix.add(el);

        },1000)

      }
    };
  }

})();
