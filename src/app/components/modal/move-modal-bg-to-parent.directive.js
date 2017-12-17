(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('repositionBg', repositionBg);

  /** @ngInject */
  function repositionBg($log) {
    return {
      restrict: 'A',
      link: function (scope, $el) {
        setTimeout(function (){
          try {
            var near = $($el).parent().parent();
            $el.prependTo(near);
            $el.css({position: 'absolute'})
          } catch (e) {
            $log.debug('An in styling bg of compose', e);
          }
        }, 100)
      }
    };
  }
})();
