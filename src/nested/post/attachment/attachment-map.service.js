(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcAttachmentMap', NstSvcAttachmentMap);

  /** @ngInject */
  function NstSvcAttachmentMap(NstSvcFileTypeService) {

    var service = {
      toAttachmentItem : toAttachmentItem
    };

    return service;

    function toAttachmentItem(attachment) {
      if (!attachment || !attachment.id){
        return {};
      }

      var model = {
        name : NstSvcFileTypeService.removeSuffix(attachment.fileName),
        size : attachment.size,
        url : attachment.file.url.view,
        type : NstSvcFileTypeService.getType(attachment.mimeType),
        extension : NstSvcFileTypeService.getSuffix(attachment.fileName),
        thumbnail : attachment.thumbnail ? attachment.thumbnail.getThumbnail('128').url.view : ''
      };

      return model;
    }
  }

})();
