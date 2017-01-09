(function() {
  'use strict';
  angular
    .module('ronak.nested.web.file')
    .service('NstSvcAttachmentMap', NstSvcAttachmentMap);

  /** @ngInject */
  function NstSvcAttachmentMap(NST_ATTACHMENT_STATUS, NstVmFile, NstSvcRandomize, NstSvcFileType, NstSvcAttachmentFactory, NstAttachment) {
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
      if (attachment instanceof NstAttachment) {
        var isAttached = NST_ATTACHMENT_STATUS.ATTACHED == attachment.status;
        id = id || attachment.id || NstSvcRandomize.genUniqId();

        return {
          id : id,
          name: NstSvcFileType.removeSuffix(attachment.getFilename()),
          isUploaded: isAttached,
          uploadedSize: isAttached ? attachment.getSize() : 0,
          uploadedRatio: isAttached ? 1 : 0,
          size: attachment.getSize(),
          url: attachment.hasThumbnail() ? attachment.picture.original : null,
          type: NstSvcFileType.getType(attachment.getMimetype()),
          extension: formatExtension(NstSvcFileType.getSuffix(attachment.getFilename())),
          thumbnail: attachment.hasThumbnail() ? attachment.picture.getUrl("x128") : null,
          hasThumbnail: attachment.hasThumbnail()
        };
      } else if (attachment instanceof NstVmFile){
        return {
          id : attachment.id,
          name: attachment.name,
          isUploaded: true,
          uploadedSize: attachment.size,
          uploadedRatio: 1,
          status : NST_ATTACHMENT_STATUS.ATTACHED,
          size: attachment.size,
          url: attachment.hasThumbnail ? attachment.thumbnail : '',
          type: attachment.type,
          extension: attachment.extension,
          thumbnail: attachment.hasThumbnail ? attachment.thumbnail : '',
          hasThumbnail: attachment.hasThumbnail
        };
      } else {
        throw Error("Could not create an EditableAttachment from an unsupported type")
      }
    }

    function formatExtension(extension) {
      return _.upperCase(_.replace(extension, '.', ''));
    }
  }
})();
