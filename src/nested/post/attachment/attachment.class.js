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
        this.fileName = null;
        this.uploadTime = null;
        this.owners = []; // [<NstPlace>]
        this.ownerIds = [];
        this.uploader = null; // <NstUser>
        this.uploaderId = null;
        this.thumbnail = null; //<NstPicture>
        this.fileName = null; // NstStoreResource

        NstModel.call(this);

        if (data) {
          this.fill(data);
        }
      }


      // make sure is it right to change the status here or not
      Attachment.prototype.setStatus = function(status) {
        this.status = status;
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
        }
      }

      Attachment.prototype.hasThumbnail = function() {
        return !!this.thumbnail && !!this.thumbnail.id;
      }

      return Attachment;
    });
})();
