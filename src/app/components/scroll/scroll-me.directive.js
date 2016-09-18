(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('scrollMe', ScrollMe);

  function ScrollMe($timeout) {
    return {
      restrict: 'A',
      link: function (scope ,element, attrs) {
        scope.$watch(attrs.scrollMe, function(newValue) {
          if (newValue) {
            var self = $(element[0]);
            var selfscr = self.find(".mCSB_dragger");
            var scrollTop = selfscr.position().top;
            if (scrollTop < 5 || selfscr['context'].clientHeight - 100 < selfscr[0].offsetHeight + scrollTop) {
              $timeout(function () {
                $(element[0]).mCustomScrollbar("scrollTo", "bottom", {
                  scrollEasing: "easeOut"
                });
              }, 300)
            }
          }
          //console.log(selfscr['context'].clientHeight,selfscr[0].offsetHeight,selfscr[0].offsetTop,scrollTop);
        });

      }
    };
  }
})();
