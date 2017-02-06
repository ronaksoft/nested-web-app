(function() {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('SvcCardCtrlAffix', SvcCardCtrlAffix);

  /** @ngInject */
  function SvcCardCtrlAffix($rootScope,$window,deviceDetector,$timeout) {
    var obj = {};

    var win = angular.element($window);
    var isMobile = deviceDetector.isMobile() || deviceDetector.isTablet();
    var isRTL = $rootScope._direction == 'rtl';
    var MobTopOff = isMobile ? 56 : 0;

    win.bind('scroll', affixElement);

    //TODO handle win resize event
    function affixElement() {
      obj.check($window.pageYOffset);
      if( $window.pageYOffset < 1200 ) {
        $rootScope.staticNav = true
      } else  {
        $rootScope.staticNav = false
      }
      // if (
      //   $window.pageYOffset + MobTopOff > $element.parent().offset().top &&
      //   $window.pageYOffset < $element.parent().children().first().height() + $element.parent().offset().top - 50
      // ) {
      //   $element.css('position', 'fixed');
      //   $element.css('top', 24 + MobTopOff + 'px');
      //   if (!isRTL) $element.css('left', $element.parent().offset().left + 'px');
      //   if (isRTL && !isMobile) $element.css('right', $element.parent().offset().left - 20 + 'px');
      //   if (isRTL && isMobile) $element.css('right', $element.parent().offset().left + 'px');
      // } else {
      //   $element.css('position', '');
      //   $element.css('top', '');
      //   $element.css('left', '');
      //   $element.css('right', '');
      // }

    }

    obj.add = function (el) {
      $rootScope.cardCtrls.push(el)
    };

    obj.change = function () {
      var buff = $rootScope.cardCtrls;
      $rootScope.cardCtrls = [];

      $timeout(function () {
        for( var i=0; i<buff.length;i++) {
          var el = {
            el : buff[i].el,
            topOff : buff[i].el.parent().offset().top,
            cardH : buff[i].el.parent().children().first().height(),
            leftOff : buff[i].el.parent().offset().left,
            fixed : false
          };
          obj.add(el)
        }
      },1000);

    };

    obj.check = function (Ypos) {
      $rootScope.cardCtrls.forEach(function (e) {
        if (Ypos + MobTopOff > e.topOff - 32 && Ypos < e.cardH + e.topOff - 82 && !e.fixed) {
          e.fixed = true;
          e.el.css('position', 'fixed');
          e.el.css('top', 56 + MobTopOff + 'px');
          if (!isRTL) e.el.css('left', e.leftOff + 'px');
          if (isRTL && !isMobile) e.el.css('right', e.leftOff - 20 + 'px');
          if (isRTL && isMobile) e.el.css('right', e.leftOff + 'px');
        } else if ((Ypos + MobTopOff < e.topOff - 32 || Ypos > e.cardH + e.topOff - 82) && e.fixed) {
          e.fixed = false;
          e.el.css('position', '');
          e.el.css('top', '');
          e.el.css('left', '');
          e.el.css('right', '');
        }


      })

    };

    return obj;
  }
})();
