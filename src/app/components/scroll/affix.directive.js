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
        var offLeft = $element.offset().left;
        var afterContent = 0;
        var height = $element.height();
        var width = $element.width();

        var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
        var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;


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
          if ($attrs.parent == 'navbar' && (isChrome || isFirefox )) {
            offLeft = parseInt($('nst-navbar').offset().left) + parseInt(parseInt(afterContent)) - parseInt($('.sidebar').offset().left);
          }else if ($attrs.parent == 'navbar' && !(isChrome || isFirefox )){
            offLeft = parseInt($('nst-navbar').offset().left) + parseInt(parseInt(afterContent));
          }else if ($attrs.parent == 'content' && (isChrome || isFirefox )){
            offLeft = parseInt($('.content').offset().left) + parseInt(parseInt(afterContent)) - parseInt($('.sidebar').offset().left);
          }else if ($attrs.parent == 'content' && !(isChrome || isFirefox )){
            offLeft = parseInt($('.content').offset().left) + parseInt(parseInt(afterContent));
          }
        }
        findLeftOffset();

        $scope.$watch(function () {
          return $('.content').offset().left
        },function (newVal,oldVal) {
          findLeftOffset();
        });

        function affixElement() {
          console.log(offLeft);
          if ($window.pageYOffset > topOffset) {
            $element.css('position', 'fixed');
            $element.css('top', parseInt(top) - parseInt(topOffset) + 'px');
            $element.css('left', offLeft + 'px');
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
