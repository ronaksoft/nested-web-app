(function () {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('SvcCardCtrlAffix', SvcCardCtrlAffix);

  /** @ngInject */
  function SvcCardCtrlAffix($rootScope, $window, deviceDetector, $timeout, $, _) {
    var obj = {};

    $rootScope.inViewPost = {
      id: 0,
      index: 0
    };
    obj.affixView = {
      id: 0,
      index: 0
    }
    $rootScope.cardCtrls = [];
    $rootScope.affixBlocks = [];
    var win = angular.element($window);
    var MobTopOff = 0;
    var winH = win.height();
    var navH = 80;
    obj.scrollPos = 0;

    $(window).resize(function () {
      obj.change();
    });

    obj.add = function (el) {
      $rootScope.cardCtrls.push(el);
      resetService();
    };
    obj.reset = function () {
      if ($rootScope.cardCtrls.length > 0) {
        $rootScope.inViewPost = {
          id: $rootScope.cardCtrls[0].id,
          index: 0
        };
        obj.orderItems();
        obj.checkInViewIndex(win[0].scrollY);
      }
    };

    var resetService = _.throttle(obj.reset, 512);
    obj.orderItems = function () {
      $rootScope.cardCtrls.sort(function (a, b) {
        return $('#post-card-' + a.id).parent().offset().top - $('#post-card-' + b.id).parent().offset().top
      });
    };

    obj.checkInViewIndex = function (Ypos) {
      var i = 0;
      var topItems = $rootScope.cardCtrls.filter(function (e, index) {
        var postCard = $('#post-card-' + e.id).parent();
        var postCardOffTop = postCard.offset().top;
        var postCardheight = postCard.height();
        var determiner = postCardOffTop + postCardheight - $('#post-card-' + $rootScope.cardCtrls[0].id).parent().offset().top;
        if(determiner < (winH / 2) + Ypos && determiner >= Ypos){
          i = index
          return true;
        } else {
          return false;
        }
      });
      var lastIndex = topItems.length - 1;
      var item = topItems[lastIndex]
      if (item) {
        $rootScope.inViewPost = {
          index: i,
          id: item.id,
          enabled: true
        }
      } else {
        $rootScope.inViewPost.enabled = false
      }
      console.log('checkInViewIndex', $rootScope.inViewPost)
    };

    obj.measurement = function (v) {
      navH = v;
    };

    obj.change = function () {
      // var buff = $rootScope.cardCtrls.slice(0);
      // winH = win.height();
      // $rootScope.cardCtrls = [];
      // if (!buff) return;
      // $timeout(function () {
      //   buff.forEach(function (b) {
      //     var el = {
      //       el: b.el,
      //       id: b.id,
      //       topOff: b.el.parent().offset().top,
      //       cardH: b.el.parent().children().first().height(),
      //       fullH: b.el.parent().height(),
      //       leftOff: b.el.parent().offset().left,
      //       fixed: b.fixed
      //     };
      //     obj.add(el);
      //   });
      //   obj.orderItems();
      // }, 100);

    };

    obj.check = function (Ypos) {
      
      // TODO statement in last scroll reverse!
      // detect scroll direction
      var scrollDown = obj.scrollPos <= Ypos;
      obj.scrollPos = Ypos;
      if ( $rootScope.cardCtrls.length === 0) {
        return;
      }
      // Offset of first post card to top ( always should remove it from Ypos for proper compute )
      var firstOffset = $('#post-card-' + $rootScope.cardCtrls[0].id).parent().offset().top;
      postInView(Ypos, scrollDown, firstOffset);
      affixPostCard(Ypos, scrollDown, firstOffset);

    };

    function postInView(Ypos, scrollDown, firstOffset) {

      // Element that is finded as visible item
      var thisEl = $rootScope.cardCtrls[$rootScope.inViewPost.index];
      if (thisEl) {
        var thisElement = $('#post-card-' + thisEl.id).parent();
        var thisElementPostCardOffTop = thisElement.offset().top;
        var thisElementPostCardheight = thisElement.height();
      }
      // measurement 
      var determiner;
      if (scrollDown) {
        var nextIndex = $rootScope.inViewPost.index + 1;
        var nextItem = $rootScope.cardCtrls[nextIndex];
        var nextElement = $('#post-card-' + nextItem.id).parent();
        var nextElementPostCardOffTop = nextElement.offset().top;
        var nextElementPostCardheight = nextElement.height();
        determiner = nextElementPostCardOffTop + nextElementPostCardheight - firstOffset;        
        if (determiner < (winH / 2) + Ypos) {
          $rootScope.inViewPost = {
            index: nextIndex,
            id: nextItem.id,
            enabled: true
          }
        } else if(thisElementPostCardOffTop + thisElementPostCardheight < firstOffset + Ypos ||
          thisElementPostCardOffTop + thisElementPostCardheight > firstOffset + Ypos + (winH * 3 / 4)) {
          $rootScope.inViewPost.enabled = false;
        }
      } else {
        if ($rootScope.inViewPost.index > 0) {
          var prvIndex = $rootScope.inViewPost.index - 1;
          var prvItem = $rootScope.cardCtrls[prvIndex];
          var prvElement = $('#post-card-' + prvItem.id).parent();
          var prvElementPostCardOffTop = prvElement.offset().top;
          var prvElementPostCardheight = prvElement.height();
          determiner = prvElementPostCardOffTop + prvElementPostCardheight - firstOffset;  
          if (
            determiner > Ypos &&
            determiner < (winH / 2) + Ypos
          ) {
            $rootScope.inViewPost = {
              index: prvIndex,
              id: prvItem.id,
              enabled: true
            }
          } else if(thisElementPostCardOffTop + thisElementPostCardheight < firstOffset + Ypos ||
            thisElementPostCardOffTop + thisElementPostCardheight > firstOffset + Ypos + (winH * 3 / 4)) {
              $rootScope.inViewPost.enabled = false;
          }
        }
      }
      
      // console.log($rootScope.inViewPost);
    }
    function affixPostCard(Ypos, scrollDown, firstOffset) {

      var determiner;
      if (scrollDown) {
        var nextIndex = obj.affixView.index + 1;
        var nextItem = $rootScope.cardCtrls[nextIndex];
        var nextElement = $('#post-card-' + nextItem.id).parent();
        var nextElementPostCardOffTop = nextElement.offset().top;

        if ( nextElementPostCardOffTop - firstOffset < Ypos ) {
          obj.affixView = {
            id: nextItem.id,
            index: nextIndex
          }
        }
      } else if (obj.affixView.index > 0) {
        var prvIndex = obj.affixView.index - 1;
        var prvItem = $rootScope.cardCtrls[prvIndex];
        var prvElement = $('#post-card-' + prvItem.id).parent();
        var prvElementPostCardOffTop = prvElement.offset().top;
        var prvElementPostCardheight = prvElement.children().first().height();
        determiner = prvElementPostCardOffTop + prvElementPostCardheight - firstOffset

        
        if ( determiner > Ypos ) {
          obj.affixView = {
            id: prvItem.id,
            index: prvIndex
          }
        }
      }
      
      // console.log(obj.affixView);
    }

    obj.scroll = function (Ypos) {
      if ( $rootScope.cardCtrls.length === 0) {
        return
      }
      var thisEl = $rootScope.cardCtrls[obj.affixView.index];
      if (thisEl) {
        var thisElement = $('#post-card-' + thisEl.id).parent();
        var thisElementPostCardOffTop = thisElement.offset().top;
        var thisElementPostCardheight = thisElement.children().first().height();
      }
      var e = $rootScope.cardCtrls[obj.affixView.index];
      if (!e.fixed && thisElementPostCardheight > winH && Ypos + MobTopOff > thisElementPostCardOffTop - (48 + navH) && Ypos < thisElementPostCardheight + thisElementPostCardOffTop - (104 + navH)) {
        e.fixed = true;
        e.el.css('position', 'fixed');
        e.el.css('top', 72 + navH + MobTopOff + 'px');
        if ($rootScope._direction !== 'rtl') e.el.css('left', e.leftOff + 'px');
        if ($rootScope._direction === 'rtl') e.el.css('right', e.leftOff + 'px');
      } else if (Ypos + MobTopOff < thisElementPostCardOffTop - (48 + navH) && e.fixed) {
        e.fixed = false;
        e.el.css('position', '');
        e.el.css('top', '');
        e.el.css('left', '');
        e.el.css('right', '');
      } else if (Ypos > thisElementPostCardheight + thisElementPostCardOffTop - (104 + navH) && e.fixed) {
        e.fixed = false;
        e.el.css('position', 'absolute');
        e.el.css('top', thisElementPostCardheight - 32 + 'px');
        e.el.css('left', '');
        e.el.css('right', '');

      }

    };

    return obj;
  }
})();
