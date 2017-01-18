(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('scrollDispatch', hideTips);

  /** @ngInject */
  function hideTips() {
    return {
      link: function ($scope, $element) {

        var scrollPos = 0;
        $(window).scroll(function(e){
          var scrollOff = 220;


          //hide tips
          dissappear($element.find('.tooltip'));
          dissappear($element.find('.popover-userdetail'));

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
