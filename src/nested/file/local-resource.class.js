(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstLocalResource', NstLocalResource);

  /** @ngInject */
  function NstLocalResource(NST_STORE_ROUTE, NST_OBJECT_EVENT, NstSvcStore, NstObservableObject) {
    function LocalResource(uri) {
      this.id = null;

      this.uri = null;

      this.picture = null;

      NstObservableObject.call(this);
    }

    LocalResource.prototype = new NstObservableObject();
    LocalResource.prototype.constructor = LocalResource;

    LocalResource.prototype.hasThumbnail = function (size) {
      if (size) {
        return this.picture && this.picture[size];
      } else {
        return this.picture
          && this.picture.x32
          && this.picture.x64
          && this.picture.x128;
      }
    };

    LocalResource.prototype.hasPreview = function () {
      return !!this.picture.preview;
    };

    return LocalResource;
  }
})();
