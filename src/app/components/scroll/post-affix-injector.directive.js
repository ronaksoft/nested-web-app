(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('postAffixInjector', affixPost);

  /** @ngInject */
  function affixPost(SvcCardCtrlAffix) {
    return {
      restrict: 'A',
      link: function ($scope, $element) {
        var el = {
          el : $element,
          // cardH : $element.parent().children().first().height(),
          // fullH : $element.parent().height(),
          leftOff : $element.parent().offset().left,
          id: $scope.$parent.ctlPostCard.post.id,
          fixed : false
        };
        SvcCardCtrlAffix.add(el);
      }
    };
  }

})();
