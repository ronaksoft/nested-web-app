(function() {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('SvcCardCtrlAffix', SvcCardCtrlAffix);

  /** @ngInject */
  function SvcCardCtrlAffix($rootScope,$window,deviceDetector,$timeout, $) {
    var obj = {};

    var win = angular.element($window);
    var isMobile = deviceDetector.isMobile() || deviceDetector.isTablet();
    var isRTL = $rootScope._direction == 'rtl';
    var MobTopOff = isMobile ? 56 : 0;
    var winH = win.height();
    var navH = 80;
    $rootScope.cardCtrls = [];

    $(window).resize(function() {
      obj.change();
    });

    obj.add = function (el) {
      $rootScope.cardCtrls.push(el);
    };

    obj.measurement = function (v) {
      navH = v;
    };

    obj.change = function () {
      var buff = $rootScope.cardCtrls.slice(0);
      $rootScope.cardCtrls = [];
      if(!buff) return;
      $timeout(function () {
        for( var i=0; i<buff.length;i++) {
          var el = {
            el : buff[i].el,
            topOff : buff[i].el.parent().offset().top,
            cardH : buff[i].el.parent().children().first().height(),
            leftOff : buff[i].el.parent().offset().left,
            fixed : buff[i].fixed
          };
          obj.add(el);
        }
      },1000);

    };

    obj.check = function (Ypos) {
      $rootScope.cardCtrls.forEach(function (e) {
        if (!e.fixed && e.cardH > winH && Ypos + MobTopOff > e.topOff - (48 + navH ) && Ypos < e.cardH + e.topOff - ( 104 + navH )) {
          e.fixed = true;
          e.el.css('position', 'fixed');
          e.el.css('top', 72 + navH + MobTopOff + 'px');
          if (!isRTL) e.el.css('left', e.leftOff + 'px');
          if (isRTL && !isMobile) e.el.css('right', e.leftOff - 20 + 'px');
          if (isRTL && isMobile) e.el.css('right', e.leftOff + 'px');
        } else if (Ypos + MobTopOff < e.topOff - (48 + navH ) && e.fixed) {
          e.fixed = false;
          e.el.css('position', '');
          e.el.css('top', '');
          e.el.css('left', '');
          e.el.css('right', '');
        } else if(Ypos > e.cardH + e.topOff - ( 104 + navH ) && e.fixed ) {
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
