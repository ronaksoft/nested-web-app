(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .directive('mailResizer', mailResizer);

  /** @ngInject */
  function mailResizer($timeout) {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        elem.css({'display': 'table'});

        $timeout(function () {
          var stndSize = elem.parents('post-card').width() - 32 || 600;
          var cardWidth = elem.width();

          if (cardWidth > stndSize && cardWidth > 900) {
            var ratio = stndSize / cardWidth;


            angular.forEach(angular.element('*', elem), function (element) {

              var fontSize = parseInt(angular.element(element).css('font-size'));
              var newFontSize = fontSize * (1 / ratio) * 0.75;

              var attr = angular.element(element).attr('fz');
              if (typeof attr !== typeof undefined && attr !== false) {
                return;
              }

              if (angular.element(element).attr('alt') === "Digikala") alert(3)

              angular.element(element).attr('fz', fontSize);

              angular.element(element).css('font-size', newFontSize > 50 ? 50 : newFontSize);
              angular.element(element).css('line-height', '115%');

            });


            // elem.css({'transform': 'scale(' + ratio +',' + ratio + '','font-size': fontRatio + '%','line-height': fontRatio + '%'});
            elem.css({
              'transform': 'scale(' + ratio + ',' + ratio + ')'
              , '-moz-transform': 'scale(' + ratio + ',' + ratio + ')'
              , '-o-transform': 'scale(' + ratio + ',' + ratio + ')'
              , '-webkit-transform': 'scale(' + ratio + ',' + ratio + ')'
              , 'display': 'block'
            });
            elem.height(elem[0].getBoundingClientRect().height + 'px');

          }

        }, 100)
      }
    };
  }

})();
