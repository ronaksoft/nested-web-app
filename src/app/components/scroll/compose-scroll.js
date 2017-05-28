(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('composeScroll', composeScroll);

  /** @ngInject */
  function composeScroll($window,$rootScope,$timeout,_) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        $element.bind('click change', function() {
          if ( $scope.ctlCompose.collapse ) {
            $scope.$emit('focus-rec');
          }
           $scope.ctlCompose.collapse = false;
        });
        // var scrollDispatcher = _.debounce(scrollDispatch, 500); 

        // $element.on('scroll',function (){
        //   scrollDispatcher();
        // });
        
        
        // function scrollDispatch () {
        //   if ( $element[0].scrollTop > 50 ) {
        //     $('.modal-bo').addClass('scrolled');
        //   } else if ( $element[0].scrollTop === 0 ) {
        //     $('.modal-bo').removeClass('scrolled');
        //   }
        // }

      }
    };
  }

})();
