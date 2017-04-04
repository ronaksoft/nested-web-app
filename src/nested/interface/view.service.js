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
    var winH = win.height();

    // win.bind('scroll', affixElement);
    $(window).resize(function() {
      obj.change();
    });

    //TODO handle win resize event
    function affixElement() {
      obj.check($window.pageYOffset);
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

        if (!e.fixed && e.cardH > winH && Ypos + MobTopOff > e.topOff - 64 && Ypos < e.cardH + e.topOff - 120) {
          e.fixed = true;
          e.el.css('position', 'fixed');
          e.el.css('top', 88 + MobTopOff + 'px');
          if (!isRTL) e.el.css('left', e.leftOff + 'px');
          if (isRTL && !isMobile) e.el.css('right', e.leftOff - 20 + 'px');
          if (isRTL && isMobile) e.el.css('right', e.leftOff + 'px');
        } else if (Ypos + MobTopOff < e.topOff - 64 && e.fixed) {
          e.fixed = false;
          e.el.css('position', '');
          e.el.css('top', '');
          e.el.css('left', '');
          e.el.css('right', '');
        } else if(Ypos > e.cardH + e.topOff - 120 && e.fixed ) {
          e.fixed = false;
          e.el.css('position', 'absolute');
          e.el.css('top', e.cardH - 32 + 'px');
          e.el.css('left', '');
          e.el.css('right', '');

        }


      })

    };

    return obj;
  }
})();
