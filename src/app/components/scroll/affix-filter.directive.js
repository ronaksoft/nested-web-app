(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('affixerFilter', onScroll);

  /** @ngInject */
  function onScroll($window,$rootScope,$timeout) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        var win = angular.element($window);
        var topOffset = 0;
        var afterContent = 0;
        var applierTrigger = false;
        var containerLeft = $('body').offset().left || 0;

        var isRTL = $rootScope._direction;

        var i = 0;

        applier();
        // $element.clone().appendTo('.content-wrapper');
        // console.log(clone);


        win.on("resize", function () {
          applier();
        });

        function applier() {
          removeFix();

          // var membrsH = 0;
          // if ($element.parent().children().first().is("#members")) membrsH = parseInt($element.parent().children().first().height()) + 38;


          var top = $element.offset().top || 0;

          topOffset = $element.offset().top - parseInt($attrs.top) - 24;

          var offLeft = $element.offset().left - 24 || 0;

          var height = $element.outerHeight();
          var width = $element.outerWidth();
          var dontSetWidth = $attrs.dontSetWidth || false;

          var actualWidth = Math.min(width, win.outerWidth());

          var fixed = false;

          if (!!$attrs.parent && $($attrs.parent).offset() ) {
            containerLeft = $($attrs.parent)[0].offsetLeft;
          }

          
          if (!!$attrs.afterContent ) {
            afterContent = $attrs.afterContent;
          }

          if (!!$attrs.fixedTop ) {
            top = parseInt($attrs.top);
          }
          if (!!$attrs.clearRight ) {
            var clearRight = true;
          }

          // affixElement();

          //for create a fixed element we need a left parameter so we read it from itself
          function findLeftOffset () {
            if (isRTL == 'rtl') {
              offLeft = parseInt(containerLeft)  +  $($attrs.parent).width()  - parseInt(afterContent) - width;
            } else {
              // offLeft = parseInt(containerLeft) + parseInt(afterContent) + 272;
            }

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
            $element.css('right', '');
            $element.css('width', '');
            $element.css('height', '');
          }


          function affixElement() {
            if (!fixed && $window.pageYOffset > topOffset) {
              $element.css('position', 'fixed');
              $element.css('top', parseInt(top) + 'px');
              if (isRTL == 'ltr')$element.css('left', offLeft + 'px');
              if (isRTL == 'rtl')$element.css('left', offLeft + 'px');
              // $element.css('height', height + 'px');
              fixed = true;
            } else if (fixed && $window.pageYOffset < topOffset ) {
              removeFix();
              fixed = false;
            }
          }

          function firstFixes() {
            if (!!$attrs.firstImp ) {
              $element.css('position', 'fixed');
              $element.css('top', parseInt(top) - parseInt(topOffset) + 'px');
              $element.css('left', offLeft + 'px');
              $element.css('width', width + 'px');
              $element.css('height', height + 'px');
              if(clearRight) {
                $element.css('right', 'auto');
              }
              return win.unbind('scroll', affixElement);
            }
          }


          findLeftOffset();
          win.bind('scroll', affixElement);
          firstFixes();

        }

        // $scope.$watch(function () {
        //
        //   //bugfix for left of undiefiend on log out
        //   if (!$('.content') || !$(".content").offset() || !$(".content").offset().left){
        //       return false;
        //   }else{
        //       return $('.content').offset().left
        //   }
        // },function (newVal,oldVal) {
        //   if(newVal)
        //     applier();
        // });

        //keep track user and change parameters
        // $scope.$on('$routeChangeStart', function() {
        //   applier();
        // });

      }
    };
  }

})();
