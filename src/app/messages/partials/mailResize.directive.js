(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .directive('mailResizer', mailResizer);

  /** @ngInject */
  function mailResizer($timeout) {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        elem.css({'display' : 'table'});
        $timeout(function () {
          var stndSize = elem.parents('post-card').width() - 32 || 600;
          var cardWidth = elem.width();
          if( cardWidth > stndSize ){
            var ratio  = stndSize/cardWidth;
            var fontRatio = 100 / ratio;
            // elem.css({'transform': 'scale(' + ratio +',' + ratio + '','font-size': fontRatio + '%','line-height': fontRatio + '%'});
            elem.css({
              'transform': 'scale(' + ratio +',' + ratio + ')'
              ,'-moz-transform': 'scale(' + ratio +',' + ratio + ')'
              ,'-o-transform': 'scale(' + ratio +',' + ratio + ')'
              ,'-webkit-transform': 'scale(' + ratio +',' + ratio + ')'
              ,'display' : 'block'
            });
            elem.parent().height(elem[0].getBoundingClientRect().height + 'px')

          }

        },100)
      }
    };
  }

})();
