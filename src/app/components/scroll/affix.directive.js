(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('affixer', onScroll);

  /** @ngInject */
  function onScroll($window) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        var win = angular.element($window);
        var topOffset = 0;
        var top = $element.offset().top;
        var offLeft = ($('.content').offset().left);
        var afterContent = 0;
        var height = ($element.height());
        var width = ($element.width());

        if (!!$attrs.offsetTop ) {
          topOffset = $attrs.offsetTop;
        }
        if (!!$attrs.top ) {
          top = $attrs.top;
        }
        if (!!$attrs.afterContent ) {
          afterContent = $attrs.afterContent;
        }

        function findLeftOffset () {
          if ($attrs.parent == 'navbar') {
            offLeft = $('nst-navbar').offset().left;
          }else if ($attrs.parent == 'content'){
            offLeft = $('.content').offset().left;
            console.log(parseInt(offLeft) + parseInt(afterContent));
          }
        }
        findLeftOffset();


        $scope.$watch(function () {
          return $('.content').offset().left
        },function (newVal,oldVal) {
          findLeftOffset();
        });

        function affixElement() {
          console.log('affix');
          if ($window.pageYOffset > topOffset) {
            $element.css('top', parseInt(top) - parseInt(topOffset) + 'px');
            $element.css('left', parseInt(offLeft) + parseInt(afterContent) + 'px');
            $element.css('position', 'fixed');
            $element.css('width', width + 'px');
            $element.css('height', height + 'px');
          } else {
            $element.css('position', 'absolute');
            $element.css('top', '');
            $element.css('left', '');
            $element.css('width', '');
            $element.css('height', '');
          }
        }

        $scope.$on('$routeChangeStart', function() {
          win.unbind('scroll', affixElement);
        });
        win.bind('scroll', affixElement);
      }
    };
  }

})();
