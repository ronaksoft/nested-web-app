(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcAttachmentMap', NstSvcAttachmentMap);

  /** @ngInject */
  function NstSvcAttachmentMap(NstSvcFileType) {
    var service = {
      toAttachmentItem : toAttachmentItem,
      toUploadAttachmentItem: toUploadAttachmentItem
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

    function toUploadAttachmentItem(attachment) {
      if (!attachment) {
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

    function formatExtension(extension) {
      return _.upperCase(_.replace(extension, '.', ''));
    }
  }
})();
