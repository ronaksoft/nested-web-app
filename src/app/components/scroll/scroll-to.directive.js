(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.scroll')
    .directive('scrollTo', ["$window", function($window){
      return {
          restrict : "AC",
          compile : function(){

              function scrollInto(elementId) {
                  if(!elementId) $window.scrollTo(0, 0);
                  //check if an element can be found with id attribute
                  var el = document.getElementById(elementId);
                  if(el) el.scrollIntoView();
              }

              return function(scope, element, attr) {
                  element.bind("click", function(event){
                      scrollInto(attr.scrollTo);
                  });
              };
          }
      };
    }]);

})();
