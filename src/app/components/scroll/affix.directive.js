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
        var afterContent = 0;
        var container = 'body';
        function applier() {
          removeFix();

          var top = $element.offset().top;
          var offLeft = $element.offset().left || 0;

          var height = $element.outerHeight();
          var width = $element.outerWidth();
          var dontSetWidth = $attrs.dontSetWidth || false;

          var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
          var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;


          if (!!$attrs.offsetTop ) {
            topOffset = $attrs.offsetTop;
          }

          if (!!$attrs.parent ) {
            container = $attrs.parent;
          }

          if (!!$attrs.top ) {
            top = top + parseInt($attrs.top);
          }

          if (!!$attrs.afterContent ) {
            afterContent = $attrs.afterContent;
          }

          if (!!$attrs.fixedTop ) {
            top = parseInt($attrs.top);
          }

          //for create a fixed element we need a left parameter so we get it from hisself
          function findLeftOffset () {
            offLeft = parseInt($(container).offset().left) + parseInt(afterContent);
            // if (isChrome || isFirefox) {
            //   offLeft = parseInt($(container).offset().left) + parseInt(afterContent) - parseInt($('.sidebar').offset().left);
            // }else if (!(isChrome || isFirefox )){
            //   offLeft = parseInt($(container).offset().left) + parseInt(afterContent);
            // }
          }
          function removeFix() {
            $element.css('position', '');
            $element.css('top', '');
            $element.css('left', '');
            $element.css('width', '');
            $element.css('height', '');
          }

          var fixed = false;

          function affixElement() {
            if ($window.pageYOffset > topOffset && !fixed) {
              $element.css('position', 'fixed');
              $element.css('top', parseInt(top) - parseInt(topOffset) + 'px');
              $element.css('left', offLeft + 'px');
              if(!dontSetWidth) $element.css('width', width + 'px');
              $element.css('height', height + 'px');
              fixed = true;
            } else if ($window.pageYOffset < topOffset && fixed) {
              removeFix();
              fixed = false;
            }
          }

          affixElement();

          function firstFixes() {
            if (!!$attrs.firstImp ) {
              $element.css('position', 'fixed');
              $element.css('top', parseInt(top) - parseInt(topOffset) + 'px');
              $element.css('left', offLeft + 'px');
              $element.css('width', width + 'px');
              $element.css('height', height + 'px');
              return win.unbind('scroll', affixElement);
            }
          }


          findLeftOffset();
          win.bind('scroll', affixElement);
          firstFixes();

        }
        applier();

        //keep track user and change parameters
        $scope.$on('$routeChangeStart', function() {
          applier();
        });

        win.on("resize", function () {
          applier();
        });

        $scope.$watch(function () {
          return $('.content').offset().left
        },function (newVal,oldVal) {
          applier();
        });
      }
    };
  }

})();
