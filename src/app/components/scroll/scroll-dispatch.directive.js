(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('scrollDispatch', hideTips);

  /** @ngInject */
  function hideTips(SvcCardCtrlAffix) {
    return {
      link: function ($scope, $element) {

        var scrollPos = 0,scrollOff = 220;
        $(window).scroll(function(e){

          SvcCardCtrlAffix.check(e.currentTarget.pageYOffset);

          //hide tips
          dissappear($element.find('.tooltip'));
          dissappear($element.find('.popover-userdetail'));
          dissappear($element.find('.popover-placedetail'));

          if(e.currentTarget.pageYOffset > scrollOff && e.currentTarget.pageYOffset < scrollPos){
            $('body').addClass('scrolled')
          } else if (e.currentTarget.pageYOffset < scrollOff || ( e.currentTarget.pageYOffset > scrollOff && $('body').hasClass('scrolled') ) ) {
            $('body').removeClass('scrolled')
          }

          scrollPos = e.currentTarget.pageYOffset;

        });

        function dissappear(el) {
          el.first().remove();
          // el.style.opacity = '0'
        }

      }
    };
  }

})();
