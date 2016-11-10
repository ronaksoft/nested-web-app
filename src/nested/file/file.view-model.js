(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmFile', NstVmFile);

  function NstVmFile(NstAttachment, moment, _, NstSvcFileType) {
    function VmFile(model) {

      this.id = null;
      this.name = null;
      this.type = null;
      this.size = null;
      this.date = null;
      this.thumbnail = null;

      if (model instanceof NstAttachment) {
        this.id = model.id;
        this.size = model.size;
        this.name = model.filename;
        this.type = NstSvcFileType.getType(model.mimeType);
        this.extension = NstSvcFileType.getSuffix(model.filename);
        this.date = moment(model.uploadTime);
        this.thumbnail = model.hasThumbnail() ? model.picture.getThumbnail(32).url.view : '';
      }

    }

    return VmFile;
  }
})();
