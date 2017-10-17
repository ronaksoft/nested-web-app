(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('moveAddAttachmentElement', moveAddAttachmentElement);

  /** @ngInject */
  function moveAddAttachmentElement($log) {
    return {
      restrict: 'A',
      link: function (scope, $el) {
        setTimeout(function (){
          try {
            var near = $($el).prev().children();
            $el.appendTo(near);
          } catch (e) {
            $log.debug('An error in styling add attachment element', e);
          }
        }, 100)
      }
    };
  }
})();
