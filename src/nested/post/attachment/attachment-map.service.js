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
        name : NstSvcFileType.removeSuffix(attachment.fileName),
        size : attachment.size,
        url : attachment.file.url.view,
        type : NstSvcFileType.getType(attachment.mimeType),
        extension : formatExtension(NstSvcFileType.getSuffix(attachment.fileName)),
        thumbnail : attachment.hasThumbnail() ? attachment.thumbnail.getThumbnail('128').url.view : null,
        hasThumbnail : attachment.hasThumbnail()
      };

      return model;
    }

    function formatExtension(extension) {
      return _.upperCase(_.replace(extension, '.', ''));
    }
  }

})();
