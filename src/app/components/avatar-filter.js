(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .filter('avatar', function() {

      return function(model, size) {

        size = size || "x32";
        if (model && model.hasPicture() && _.isFunction(model.picture.getUrl)) {
          return model.picture.getUrl(size);
        }

        return null;
      }

    });
})();
