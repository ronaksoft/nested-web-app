(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('scrollDispatch', hideTips);

  /** @ngInject */
  function hideTips(SvcCardCtrlAffix, $, wdtEmojiBundle) {
    return {
      link: function ($scope, $element) {

        $(window).scroll(function(e){

          SvcCardCtrlAffix.check(e.currentTarget.pageYOffset);

          //hide tips
          dissappear($element.find('.tooltip'));
          dissappear($element.find('.hide-on-scroll'));
          wdtEmojiBundle.close();
          for ( var i = 0; i < wdtEmojiBundle.eventListeners.fadeOut.length; i++ ) {
            document.removeEventListener("click", wdtEmojiBundle.eventListeners.fadeOut[i]);
          }
        });

        function dissappear(el) {
          el.first().remove();
        }

      }
    };
  }

})();
