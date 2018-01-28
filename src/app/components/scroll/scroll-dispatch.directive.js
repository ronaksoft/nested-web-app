(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('scrollDispatch', hideTips);

  /** @ngInject */
  function hideTips(SvcCardCtrlAffix, $, wdtEmojiBundle, _, $rootScope, $log, $window) {
    return {
      link: function ($scope, $element) {
        var removePopovers = _.throttle(remover, 64);
        var check = _.throttle(SvcCardCtrlAffix.check, 64);
        var reachEndThrottle = _.throttle(ReachEnd, 256);
        var scroll = SvcCardCtrlAffix.scroll;

        angular.element($window).bind("scroll", function() {
          var scrollTop = this.pageYOffset;
          var scrollHeight = $('body').height();
          if (scrollTop < 300) {
            // Affix block
            affixBlocks(scrollTop)
          }
          if (scrollTop > loadMoreScrollProperValue(this.innerHeight, scrollHeight)) {
            // Reach end dispatcher
            reachEndThrottle();
          }
          try {
            check(scrollTop);
            scroll(scrollTop);
          } catch (e) {}

          //hide tips
          removePopovers()
        });

        function remover() {
          dissappear($element.find('.tooltip'));
          dissappear($element.find('.hide-on-scroll'));
          wdtEmojiBundle.close();
          for (var i = 0; i < wdtEmojiBundle.eventListeners.fadeOut.length; i++) {
            document.removeEventListener("click", wdtEmojiBundle.eventListeners.fadeOut[i]);
          }
        }

        function loadMoreScrollProperValue(frameHeight, scrollHeight){
          if ( scrollHeight < 25 * frameHeight) {
            // console.log(11);
            return (scrollHeight - frameHeight) * 0.9;
          } else {
            // console.log(222);
            return scrollHeight - 2 * frameHeight;
          }
        }

        function affixBlocks(scrollTop) {
          $rootScope.affixBlocks.forEach(function (block) {
            if (!block.fixed && scrollTop > block.topOffset) {
              block.el.css('position', 'fixed');
              block.el.css('transform', 'translateX(-50%)');
              if (window.nativeScroll) {
                block.el.css('left', '50%');
              } else {
                block.el.css('left', '50vw');
              }
              block.el.css('display', '');
              block.fixed = true;
            } else if (block.fixed && scrollTop < block.topOffset) {
              removeFix(block);
              block.fixed = false;
            }
          })
        }

        function removeFix(block) {
          block.el.css('position', '');
          block.el.css('top', '');
          block.el.css('left', '');
          block.el.css('right', '');
          block.el.css('width', '');
          block.el.css('height', '');
          block.el.css('transform', '');
          block.el.css('left', '0');
          if (block.hideThis) {
            block.el.css('display', 'none');
          }
        }

        function dissappear(el) {
          el.first().remove();
        }

        function ReachEnd() {
          $log.debug('Reached the end of body')
          $rootScope.$broadcast('scroll-reached-bottom');
        }

      }
    };
  }

})();
