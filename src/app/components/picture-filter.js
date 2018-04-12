(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .filter('picture', function() {

      return function(model, size) {
        size = size || "x32";
        console.log(1);
        if (model && model.hasPicture && model.hasPicture()) {
          return model.picture.getUrl(size);
        }
        console.log(model, model.x32, model.x32.length > 0);
        if (model && model.x32 && model.x32.length > 0) {
          console.log(2);
          return model.getUrl(size);
        }

        console.log(3);
        return '/assets/icons/absents_place.svg';
      }

    });
})();
