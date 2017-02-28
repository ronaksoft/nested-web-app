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
        $timeout(function () {


          //TODO : number maybe change in responsive view
          var stndSize = elem.parents('post-card').width() - 32 || 600;
          var cardWidth = elem.width();

          if( cardWidth > stndSize ){
            var ratio  = stndSize/cardWidth;
            var fontRatio = 100 / ratio;
            console.log(ratio);
            elem.css({'transform': 'scale(' + ratio +',' + ratio + '','font-size': fontRatio + '%','line-height': fontRatio + '%'})
          }

        },100)
      }
    };
  }

})();
