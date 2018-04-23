(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .directive('mailResizer', mailResizer);

  /** @ngInject */
  function mailResizer($timeout) {
    return {
      restrict: 'A',
      link: function (scope, elem) {
        elem.css({'display': 'table'});
        elem.css({'width': '100%'});

        //TODO: remove Time out and start after loading all contents ( img s )
        $timeout(function () {
          var stndSize = elem.parents('post-card').width() - 48 || 600;
          var cardWidth = elem.children().first().width();

          if (cardWidth >= stndSize && cardWidth < 900) {
            var ratio = stndSize / cardWidth;


            angular.forEach(angular.element('*', elem), function (element) {

              if (angular.element(element).text() !== angular.element(element).html()){
                return;
              }

              var fontSize = parseInt(angular.element(element).css('font-size'));
              var newFontSize = fontSize * (1 / ratio) * 1;

              var attr = angular.element(element).attr('fz');
              if (typeof attr !== typeof undefined && attr !== false) {
                return;
              }


              angular.element(element).attr('fz', fontSize);

              angular.element(element).css('font-size', newFontSize > 50 ? 50 : newFontSize);
              angular.element(element).css('line-height', '115%');

            });

            elem.css({
              'transform': 'scale(' + ratio + ',' + ratio + ')'
              , '-moz-transform': 'scale(' + ratio + ',' + ratio + ')'
              , '-o-transform': 'scale(' + ratio + ',' + ratio + ')'
              , '-webkit-transform': 'scale(' + ratio + ',' + ratio + ')'
            });
            if (ratio !== 1 ) {
              elem.height(elem[0].getBoundingClientRect().height + 'px');
              elem.parents('.post-body').css({
                'direction': 'inherit'
              })
            }
            elem.css({
              'display': 'block',
              'width': stndSize * ( 1 / ratio)
            });

          }

        }, 100)
      }
    };
  }

})();
