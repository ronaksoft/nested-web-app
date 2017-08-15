(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('affixPost', affixPost);

  /** @ngInject */
  function affixPost($timeout,SvcCardCtrlAffix) {
    return {
      restrict: 'A',
      link: function ($scope, $element) {
        $timeout(function () {
          var el = {
            el : $element,
            topOff : $element.parent().offset().top,
            cardH : $element.parent().children().first().height(),
            leftOff : $element.parent().offset().left,
            fixed : false
          };
          SvcCardCtrlAffix.add(el);
        },100);
      }
    };
  }

})();
