(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcAttachmentMap', NstSvcAttachmentMap);

  /** @ngInject */
  function NstSvcAttachmentMap(NstSvcFileType) {
    var service = {
      toAttachmentItem : toAttachmentItem
    };

    return service;

    function toAttachmentItem(attachment) {
      if (!attachment || !attachment.id){
        return {};
      }
      var model = {
        name: NstSvcFileType.removeSuffix(attachment.getFileName()),
        size: attachment.getSize(),
        url: attachment.getResource().getUrl().view,
        type: NstSvcFileType.getType(attachment.getMimeType()),
        extension: formatExtension(NstSvcFileType.getSuffix(attachment.getFileName())),
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
