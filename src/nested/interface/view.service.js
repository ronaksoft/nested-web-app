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
    };
    obj.oldNumbers = 0;
    $rootScope.cardCtrls = [];
    $rootScope.affixBlocks = [];
    var win = angular.element($window);
    var MobTopOff = 0;
    var winH = win.height();
    var navH = 80;
    obj.scrollPos = 0;

    obj.reset = function () {
      if ($rootScope.cardCtrls.length > 0) {
        $rootScope.inViewPost = {
          id: $rootScope.cardCtrls[0].id,
          index: 0,
          enabled: true
        };
        obj.orderItems();
        obj.findAffixIndex(win[0].scrollY);
        obj.findInViewCardIndex(win[0].scrollY);
      }
    };

    obj.remove = function (id) {
      var card = _.find($rootScope.cardCtrls, function(o, index){
        return o.id === id
      });
      if (card) {
        var index = $rootScope.cardCtrls.indexOf(card);
        $rootScope.cardCtrls.splice(index, 1);
        obj.reset();
      }
    };

    var resetService = _.throttle(obj.reset, 512);

    /**
     * @property affixElement
     * 
     * @param {object} el 
     */
    obj.add = function (el) {
      $rootScope.cardCtrls.push(el);
      resetService();
    };

    obj.orderItems = function () {
      this.persisItems();
      $rootScope.cardCtrls.sort(function (a, b) {
        return $('#post-card-' + a.id).parent().offset().top - $('#post-card-' + b.id).parent().offset().top
      });
      // console.log('orderItems', $rootScope.cardCtrls)
    };

    obj.persisItems = function () {
      angular.forEach($rootScope.cardCtrls,function(b){
        if(!b || !$('#post-card-' + b.id).parent().offset()){
          $rootScope.cardCtrls.splice($rootScope.cardCtrls.indexOf(b), 1);
        }
        return;
      })
    };

    obj.findInViewCardIndex = function (Ypos) {
      var i = 0;
      var topItems = $rootScope.cardCtrls.filter(function (e, index) {
        var postCard = getElementProps(index);
        // var firstOffset = $('#post-card-' + $rootScope.cardCtrls[0].id).parent().offset().top;
        var firstOffset = 136;
        var determiner = postCard.postCardOffTop + postCard.postCardheight - firstOffset - 32 - 48;
        if (determiner < Ypos + winH) {
          i = index
          return true;
        } else {
          return false;
        }
      });
      var lastIndex = topItems.length - 1;
      var item;
      if(Ypos === 0) {
        item = topItems[0];
        i = 0;
      } else {
        item = topItems[lastIndex]
      }
      if (item) {
        $rootScope.inViewPost = {
          index: i,
          id: item.id,
          enabled: true
        }
      } else {
        $rootScope.inViewPost.enabled = false
      }
      // console.log('findInViewCardIndex', $rootScope.inViewPost)
    };
    obj.findAffixIndex = function (Ypos) {
      var i = 0;
      var topItems = $rootScope.cardCtrls.filter(function (e, index) {
        var postCard = $('#post-card-' + e.id).parent();
        var postCardOffTop = postCard.offset().top;
        var firstOffset = $('#post-card-' + $rootScope.cardCtrls[0].id).parent().offset().top;
        var determiner = postCardOffTop - firstOffset;
        if (determiner <= Ypos) {
          i = index
          return true;
        } else {
          return false;
        }
      });
      var lastIndex = topItems.length - 1;
      var item = topItems[lastIndex];

      if (item) {
        obj.affixView = {
          id: item.id,
          index: i
        }
      } else {
        $rootScope.inViewPost.enabled = false
      }
      // console.log('findAffixIndex', $rootScope.inViewPost)
    };

    obj.measurement = function (v) {
      navH = v;
    };

    obj.check = function (Ypos) {
      if (Ypos + 200 < obj.oldNumbers || Ypos - 200 > obj.oldNumbers) {
        obj.findAffixIndex(Ypos);
        obj.findInViewCardIndex(Ypos);
      }
      obj.oldNumbers = Ypos;
      // TODO statement in last scroll reverse!
      // detect scroll direction
      var scrollDown = obj.scrollPos <= Ypos;
      obj.scrollPos = Ypos;
      if ($rootScope.cardCtrls.length === 0) {
        return;
      }
      // Offset of first post card to top ( always should remove it from Ypos for proper compute )
      // var firstOffset = $('#post-card-' + $rootScope.cardCtrls[0].id).parent().offset().top;
      var firstOffset = 136;
      $timeout(function (){
        applyPostInView(Ypos, scrollDown, firstOffset);
        applyAffixCard(Ypos, scrollDown, firstOffset);
      })

    };

    obj.scroll = function (Ypos) {
      if ($rootScope.cardCtrls.length === 0) {
        return
      }
      var e = $rootScope.cardCtrls[obj.affixView.index];
      if (e) {
        var thisElement = $('#post-card-' + e.id).parent();
        var thisElementPostCardOffTop = thisElement.offset().top;
        var thisElementPostCardheight = thisElement.children().first().height();
      }
      if (!e.fixed &&
        thisElementPostCardheight > winH &&
        Ypos + MobTopOff > thisElementPostCardOffTop - (48 + navH) &&
        Ypos < thisElementPostCardheight + thisElementPostCardOffTop - (104 + navH)
      ) {
        e.fixed = true;
        e.el.css('position', 'fixed');
        e.el.css('top', 72 + navH + MobTopOff + 'px');
        if ($rootScope._direction !== 'rtl') e.el.css('left', e.leftOff + 'px');
        if ($rootScope._direction === 'rtl') e.el.css('right', e.leftOff + 'px');
      } else if (
        e.fixed &&
        Ypos + MobTopOff < thisElementPostCardOffTop - (48 + navH)
      ) {
        e.fixed = false;
        e.el.css('position', '');
        e.el.css('top', '');
        e.el.css('left', '');
        e.el.css('right', '');
      } else if (
        e.fixed &&
        Ypos > thisElementPostCardheight + thisElementPostCardOffTop - (104 + navH)
      ) {
        e.fixed = false;
        e.el.css('position', 'absolute');
        e.el.css('top', thisElementPostCardheight - 32 + 'px');
        e.el.css('left', '');
        e.el.css('right', '');

      }

    };

    function applyPostInView(Ypos, scrollDown, firstOffset) {

      // console.log($rootScope.inViewPost);
      // Element that is finded as visible item
      var thisEl = getElementProps($rootScope.inViewPost.index);
      // measurement for post view is end of the post
      var thisDeterminer, nextDeterminer, prvDeterminer;
      if (thisEl) {
        thisDeterminer = thisEl.postCardOffTop + thisEl.postCardheight - firstOffset - 32 - 48;
        if (thisDeterminer < Ypos + winH && thisDeterminer > Ypos ) {
          // return $rootScope.inViewPost.enabled = true; // FIXME it stops applying to first item in view
          $rootScope.inViewPost.enabled = true;
        } else {
          $rootScope.inViewPost.enabled = false;
        }
      }
      if (scrollDown) {
        if ($rootScope.inViewPost.index === $rootScope.cardCtrls.length){
          return;
        }
        var nextIndex = $rootScope.inViewPost.index + 1;
        var nextElement = getElementProps(nextIndex);
        if(!nextElement) {
          return;
        }
        nextDeterminer = nextElement.postCardOffTop + nextElement.postCardheight - firstOffset;
        if (nextDeterminer < Ypos + winH && nextDeterminer > Ypos) {
          return $rootScope.inViewPost = {
            index: nextIndex,
            id: nextElement.id,
            enabled: true
          }
        } 
      } else {
        if ($rootScope.inViewPost.index > 0) {
          var prvIndex = $rootScope.inViewPost.index - 1;
          var prvElement = getElementProps(prvIndex);
          prvDeterminer = prvElement.postCardOffTop + prvElement.postCardheight - firstOffset;
          if (prvDeterminer < Ypos + winH && prvDeterminer > Ypos) {
            return $rootScope.inViewPost = {
              index: prvIndex,
              id: prvElement.id,
              enabled: true
            }
          }
        }
      }

    }

    function applyAffixCard(Ypos, scrollDown, firstOffset) {

      var determiner;
      if (scrollDown) {
        if (obj.affixView.index === $rootScope.cardCtrls.length - 1){
          return;
        }
        var nextIndex = obj.affixView.index + 1;
        var nextElement = getElementProps(nextIndex);

        if (nextElement.postCardOffTop - firstOffset < Ypos) {
          obj.affixView = {
            id: nextElement.id,
            index: nextIndex
          }
        }
      } else if (obj.affixView.index > 0) {
        var prvIndex = obj.affixView.index - 1;
        var prvElement = getElementProps(prvIndex);
        determiner = prvElement.postCardOffTop + prvElement.postCardfullHeight - firstOffset


        if (determiner > Ypos) {
          obj.affixView = {
            id: prvElement.id,
            index: prvIndex
          }
        }
      }
    
      // console.log(obj.affixView);
    }
    
    return obj;
    function getElementProps(index){
      var nextItem = $rootScope.cardCtrls[index];
      if(!nextItem) {
        return;
      }
      var nextElement = $('#post-card-' + nextItem.id).parent();
      return {
        id: nextItem.id,
        postCardOffTop: nextElement.offset().top,
        postCardheight: nextElement.height(),
        postCardfullHeight: nextElement.children().first().height()
      }
    }
  }
})();
