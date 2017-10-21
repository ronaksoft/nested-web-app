(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('scrollDispatch', hideTips);

  /** @ngInject */
  function hideTips(SvcCardCtrlAffix, $, wdtEmojiBundle, _) {
    return {
      link: function ($scope, $element) {
         var removePopovers = _.throttle(remover, 64)
         var check = _.throttle(SvcCardCtrlAffix.check, 64)
         var scroll = SvcCardCtrlAffix.scroll
        $(window).scroll(function(e){
          var scrollTop = e.currentTarget.pageYOffset;

          
          // Affix block
          check(scrollTop);
          scroll(scrollTop);

          //hide tips
          removePopovers()
          // Reach end check
        });
        
        function remover() {
          dissappear($element.find('.tooltip'));
          dissappear($element.find('.hide-on-scroll'));
          wdtEmojiBundle.close();
          for ( var i = 0; i < wdtEmojiBundle.eventListeners.fadeOut.length; i++ ) {
            document.removeEventListener("click", wdtEmojiBundle.eventListeners.fadeOut[i]);
          }
        }

        function dissappear(el) {
          el.first().remove();
        }

      }
    };
  }

})();
