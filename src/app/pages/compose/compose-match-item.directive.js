/**
 * @file app/pages/compose/compose-match-item.directive.js
 * @desc handles a ui treatment for compose recipients
 * @kind {directive}
 * Documented by:          robzizo < me@robzizo.ir >
 * Date of documentation:  2017-08-02
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('composeMatchItem', composeMatchItem);

  function composeMatchItem($timeout, $interval, toastr, $q, $stateParams) {
    return {
      restrict: 'A',
      scope: {
        onItemClick: '=',
        items: '=',
        mode: '=',
        badge: '=',
        postId: '='
      },
      link: function (scope, ele) {
        $timeout(getSizes,0);
        var containerW, itemsW = 0, overflowed = false, lastIndex = 0;

        // $interval(function(){
        //   console.log(ele.children().length);
        // },2000);
        // scope.$watch(function (){
        //   return ele.children().length;
        // },function (){
        //   return getSizes();
        // });
        scope.$on('compose-add-item',getSizes);


        /**
         * @function
         * for ui treatments
         * this function collapse the recipients box into one line and adds 
         * an element called `more-reci` at the end of first line
         */
        function getSizes(){
          // remove `more-reci` element 
          $('#more-reci').remove();
          itemsW = 0;
          overflowed = false;
          containerW = ele.parent().parent()[0].offsetWidth;
          var childs = ele.children();
          $timeout(function(){if ( childs.length > 0 ) {
             for ( var i = 0; i < childs.length; i++) {

               if ( !overflowed ) {
                 itemsW += childs[i].offsetWidth + 4;
                 lastIndex = i;
               }

               if ( itemsW + 36 > containerW ) {
                  overflowed = true;
               }

            }
            if ( overflowed ) {
              var x = childs.length - lastIndex;
              ele.children().eq(lastIndex - 1).after('<span id="more-reci">+' + x + '</span>');
            }
          }},2);
         
        }
        
      }
    };
  }
})();
