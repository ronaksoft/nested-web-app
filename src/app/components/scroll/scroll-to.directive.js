(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('scrollTo', ["$window", function($window){
      return {
          restrict : "AC",
          compile : function(){

              return function(scope, element, attr) {
                  element.bind("click", function(){
                      scrollInto(attr.scrollTo);
                  });
                  
                function scrollInto(elementId) {
                    if(!elementId) $window.scrollTo(0, 0);
                    //check if an element can be found with id attribute
                    var el = document.getElementById(elementId);
                    if(!el) return; 
                    if ( window.nativeScroll) {
                        el.scrollIntoView();
                    } else {
                        scope.scrollInstance.scrollToElement(el)
                    }
                }
              };
          }
      };
    }]);

})();
