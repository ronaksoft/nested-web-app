(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('hideTips', hideTips);

  /** @ngInject */
  function hideTips($timeout,$interval) {
    return {
      link: function ($scope, $element) {

        var sss;

        $(window).scroll(function(e){
          dissappear($element.find('.tooltip'));
          dissappear($element.find('.tooltip'));


        });

        function dissappear(el) {
          el.first().remove();
          // el.style.opacity = '0'
        }

      }
    };
  }

})();
