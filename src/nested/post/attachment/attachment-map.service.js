(function() {
  'use strict';
  angular
    .module('ronak.nested.web.file')
    .service('NstSvcAttachmentMap', NstSvcAttachmentMap);

  /** @ngInject */
  function NstSvcAttachmentMap(_, NST_ATTACHMENT_STATUS, NstVmFile, NstSvcRandomize, NstSvcFileType) {
    var service = {
      toAttachmentItem : toAttachmentItem,
      toEditableAttachmentItem: toEditableAttachmentItem
    };

    return service;

    function toAttachmentItem(attachment) {
      return new NstVmFile(attachment);
    }

    function toEditableAttachmentItem(attachment, id) {
      if (!attachment) {
        return {};
      }
      var isAttached = NST_ATTACHMENT_STATUS.ATTACHED == attachment.status;
      id = id || attachment.id || NstSvcRandomize.genUniqId();

      var model = null;


      if (attachment instanceof NstVmFile) {

        model = {
          id : id,
          name: NstSvcFileType.removeSuffix(attachment.name),
          isUploaded: isAttached,
          uploadedSize: isAttached ? attachment.size : 0,
          uploadedRatio: isAttached ? 1 : 0,
          size: attachment.size,
          url: attachment.hasThumbnail ? attachment.thumbnail : null,
          type: attachment.type,
          extension: attachment.extension,
          thumbnail: attachment.hasThumbnail ? attachment.thumbnail : null,
          hasThumbnail: attachment.hasThumbnail
        };
      } else {
        model = {
          id : id,
          name: NstSvcFileType.removeSuffix(attachment.getFilename()),
          isUploaded: isAttached,
          uploadedSize: isAttached ? attachment.getSize() : 0,
          uploadedRatio: isAttached ? 1 : 0,
          size: attachment.getSize(),
          url: attachment.hasThumbnail() ? attachment.picture.original : null,
          type: NstSvcFileType.getType(attachment.getMimetype()),
          extension: formatExtension(NstSvcFileType.getSuffix(attachment.getFilename())),
          thumbnail: attachment.hasThumbnail() ? attachment.picture.x128.indexOf('data:') == 0  ? attachment.picture.x128 : attachment.picture.getUrl('x128') : null,
          hasThumbnail: attachment.hasThumbnail()
        };
      }

      return model;
    }

    function formatExtension(extension) {
      return _.upperCase(_.replace(extension, '.', ''));
    }
  }
})();
