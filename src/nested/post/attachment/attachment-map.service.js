(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcAttachmentMap', NstSvcAttachmentMap);

  /** @ngInject */
  function NstSvcAttachmentMap(NST_ATTACHMENT_STATUS, NstSvcRandomize, NstSvcFileType, NstSvcAttachmentFactory) {
    var service = {
      toAttachmentItem : toAttachmentItem,
      toEditableAttachmentItem: toEditableAttachmentItem
    };

    return service;

    function toAttachmentItem(attachment) {
      if (!attachment || !attachment.id) {
        return {};
      }

      var model = {
        id: attachment.getId(),
        name: NstSvcFileType.removeSuffix(attachment.getFilename()),
        isDownloaded: false,
        downloadedSize: 0,
        downloadedRatio: 0,
        size: attachment.getSize(),
        url: attachment.getResource().getUrl().view,
        urls: {
          view: attachment.getResource().getUrl().view,
          download: attachment.getResource().getUrl().download,
          stream: attachment.getResource().getUrl().stream
        },
        type: NstSvcFileType.getType(attachment.getMimeType()),
        extension: formatExtension(NstSvcFileType.getSuffix(attachment.getFilename())),
		meta: {},
        thumbnail: attachment.hasThumbnail() ? attachment.getPicture().getLargestThumbnail().getUrl().view : null,
        hasThumbnail: attachment.hasThumbnail()
      };

      return model;
    }

    function toEditableAttachmentItem(attachment, id) {
      if (!attachment) {
        return {};
      }

      var isAttached = NST_ATTACHMENT_STATUS.ATTACHED == attachment.getStatus();
      id = id || attachment.id || NstSvcRandomize.genUniqId();

      var model = {
        id : id,
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
