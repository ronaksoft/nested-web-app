angular.module('ronak.nested.web.place').directive('placeItems', placeItems);

function placeItems() {
  var directive = {
        link: link,
        templateUrl: 'app/pages/places/list/place.items.html',
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
