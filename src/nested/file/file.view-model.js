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
      this.hasThumbnail = null;
      this.thumbnail = null;
      this.hasPreview = null;
      this.preview = null;
      this.extension = null;
      this.mimetype = null;

      if (model instanceof NstAttachment) {
        this.id = model.id;
        this.size = model.size;
        this.name = model.filename;
        this.type = NstSvcFileType.getType(model.mimetype);
        this.extension = NstSvcFileType.getSuffix(model.filename);
        this.date = moment(model.uploadTime);
        this.hasThumbnail = model.hasThumbnail();
        this.thumbnail = model.hasThumbnail() ? model.picture.getUrl("x128") : '';
        this.hasPreview = model.hasPreview();
        this.preview = model.hasPreview() ? model.picture.getUrl("preview") : '';
        this.mimetype = model.mimetype;
        this.width = model.width;
        this.height = model.height;
        if (this.width && this.height){
          this.ratio = this.width / this.height
        }
      }

    }

    return VmFile;
  }
})();
