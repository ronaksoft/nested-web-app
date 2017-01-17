(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .filter('avatar', function(moment) {

      return function(model, size) {
        size = size || "x32";
        if (model && model.hasPicture()) {
          return model.picture.getUrl(size);
        }

        return null;
      }

    });
})();
