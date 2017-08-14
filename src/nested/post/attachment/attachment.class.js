(function() {
  'use strict';

  angular.module('ronak.nested.web.models')
  .factory('NstAttachment', NstAttachment);

  function NstAttachment() {
    Attachment.prototype = {};
    Attachment.prototype.constructor = Attachment;

    function Attachment() {

      this.id = null;

      this.filename = null;

      this.size = null;

      this.picture = null;

      this.mimetype = null;

      this.uploadTime = null;

      this.uploadType = null;

      this.type = null;

      this.extension = null;

      this.width = null;

      this.height = null;

      this.post = null;
    }

    Attachment.prototype.hasThumbnail = function (size) {
      if (size) {
        return this.picture && this.picture[size];
      } else {
        return this.picture
          && this.picture.x32
          && this.picture.x64
          && this.picture.x128;
      }
    };

    Attachment.prototype.hasPreview = function () {
      return this.picture && this.picture.preview;
    };

    return Attachment;
  }
})();
