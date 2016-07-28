angular.module('nested').directive('placeItems', placeItems);

function placeItems() {
  var directive = {
        link: link,
        templateUrl: '/app/places/list/place.items.html',
        restrict: 'EA',
        scope: {
          items: '=',
          select: '='
        }
    };

    return directive;

    function link(scope, element, attrs) {
      
    }
}
