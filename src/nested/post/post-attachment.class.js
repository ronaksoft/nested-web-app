(function() {
  'use strict';

  angular.module('nested').factory('NstAttachment', function(NstModel) {

      Attachment.prototype = new NstModel();
      Attachment.constructor = Attachment;

      function Attachment(data) {
        this.id = null;
        this.post = null;
        this.storeId = null;
        this.downloads = -1;
        this.size = 0;
        this.status = null;
        this.mimeType = null;
        this.name = null;
        this.uploadTime = null;
        this.owners = []; // [<NstPlace>]
        this.uploader = null; // <NstUser>
        this.thumbs = {
          x32: null,
          x64: null,
          x128: null
        };
        this.file = null; // NstStoreResource

        NstModel.call(this);

        if (data) {
          this.setData(data);
        }
      }


      // make sure is it right to change the status here or not
      Attachment.prototype.setStatus = function(status) {
        this.status = status;
        this.change();
      }.bind(this);

      Attachment.prototype.getClientId = function() {
        if (!this.clientId) {
          // TODO: Not sure about clientId maybe it should be moved to somewhere like the related factory
          this.clientId = _.uniqueId('compose_attach_');
        }
        return this.clientId;
      }

      Attachment.prototype.setUploadCanceler = function(canceler) {
        this.canceler = canceler;
      }

      Attachment.prototype.cancelUpload = function() {
        if (this.canceler) {
          this.canceler();
          this.status = NST_ATTACHMENT_STATUS.ABORTED;
          this.change();
        }
      }

      return Attachment;
    });
})();
