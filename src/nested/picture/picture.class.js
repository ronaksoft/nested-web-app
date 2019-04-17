(function() {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstPicture', NstPicture);

  /** @ngInject */
  function NstPicture(NstSvcStore) {
    function Picture(data) {
      this.original = null;
      this.preview = null;
      this.x128 = null;
      this.x64 = null;
      this.x32 = null;

      if (data) {
        this.original = data.org;
        this.preview = data.pre;
        this.x128 = data.x128;
        this.x64 = data.x64;
        this.x32 = data.x32;
      }
    }

    Picture.prototype = {};
    Picture.prototype.constructor = Picture;

    Picture.prototype.getUrl = function (size) {
      return (this.preview && this[size]) ? NstSvcStore.getViewUrl(this[size]) : '';
    };

    return Picture;
  }
})();
