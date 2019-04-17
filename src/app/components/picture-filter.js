(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .filter('picture', function() {

      return function(model, size) {
        size = size || "x32";
        if (model && model.hasPicture && model.hasPicture()) {
          return model.picture.getUrl(size);
        }
        if (model && model.x32 && model.x32.length > 0) {
          return model.getUrl(size);
        }
        return '/assets/icons/absents_place.svg';
      }

    });
})();
