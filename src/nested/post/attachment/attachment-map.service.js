(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcAttachmentMap', NstSvcAttachmentMap);

  /** @ngInject */
  function NstSvcAttachmentMap(NST_ATTACHMENT_STATUS, NstSvcFileType) {
    var service = {
      toAttachmentItem : toAttachmentItem,
      toEditableAttachmentItem: toEditableAttachmentItem
    };

    return service;

    function toAttachmentItem(attachment) {
      if (!attachment || !attachment.id){
        return {};
      }

      var model = {
        name: NstSvcFileType.removeSuffix(attachment.getFilename()),
        size: attachment.getSize(),
        url: attachment.getResource().getUrl().view,
        type: NstSvcFileType.getType(attachment.getMimeType()),
        extension: formatExtension(NstSvcFileType.getSuffix(attachment.getFilename())),
        thumbnail: attachment.hasThumbnail() ? attachment.getPicture().getLargestThumbnail().getUrl().view : null,
        hasThumbnail: attachment.hasThumbnail()
      };

      return model;
    }

    function toEditableAttachmentItem(attachment) {
      if (!attachment) {
        return {};
      }

      var isAttached = NST_ATTACHMENT_STATUS.ATTACHED == attachment.getStatus();

      var model = {
        name: NstSvcFileType.removeSuffix(attachment.getFilename()),
        isUploaded: isAttached,
        uploadedSize: isAttached ? attachment.getSize() : 0,
        uploadedRatio: isAttached ? 1 : 0,
        size: attachment.getSize(),
        url: attachment.getResource().getUrl().view,
        type: NstSvcFileType.getType(attachment.getMimeType()),
        extension: formatExtension(NstSvcFileType.getSuffix(attachment.getFilename())),
        thumbnail: attachment.hasThumbnail() ? attachment.getPicture().getLargestThumbnail().getUrl().view : null,
        hasThumbnail: attachment.hasThumbnail()
      };

      return model;
    }

    function formatExtension(extension) {
      return _.upperCase(_.replace(extension, '.', ''));
    }
  }
})();
