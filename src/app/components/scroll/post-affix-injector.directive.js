(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('postAffixInjector', affixPost);

  /** @ngInject */
  function affixPost(SvcCardCtrlAffix, $timeout) {
    return {
      restrict: 'A',
      scope: {
        postRef: '='
      },
      link: function ($scope, $element) {
        var el = {
          el: $element,
          // cardH: 0, //$element.parent().children().first().height(),
          fullH: 0, //$element.parent().height(),
          leftOff: $element.parent().offset().left,
          id: $scope.$parent.ctlPostCard.post.id,
          fixed: false
        };
        var item = {};
        $timeout(function () {
          item = SvcCardCtrlAffix.add(el);
        }, 100);
        $timeout(function () {
          item.fullH = $element.parent().height() + 64;
          $scope.postRef.affix = item;
        }, 500);
      }
    };
  }

})();
