(function() {
  'use strict';

  angular.module('ronak.nested.web.models')
  .factory('NstAttachment', NstAttachment);

  function NstAttachment(NstModel) {
    Attachment.prototype = new NstModel();
    Attachment.prototype.constructor = Attachment;

    function Attachment(data) {

      this.id = null;

      this.filename = null;

      this.size = null;

      this.picture = null;

      this.mimetype = null;

      NstModel.call(this);

      if (data) {
        this.fill(data);
      }
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
      return !!this.picture.preview;
    };

    return Attachment;
  }
})();
