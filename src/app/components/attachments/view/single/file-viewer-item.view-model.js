(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmFileViewerItem', NstVmFileViewerItem);

  function NstVmFileViewerItem(NstAttachment, NstVmFile, moment, _) {
    function VmFileViewerItem(model) {

      this.id = null;
      this.name = null;
      this.extension = null;
      this.type = null;
      this.size = null;
      this.date = null;
      this.preview = null;
      this.hasPreview = null;
      this.viewUrl = null;
      this.downloadUrl = null;
      this.downloadToken = null;

      if (model instanceof NstAttachment) {

        this.id = model.id;
        this.name = model.filename;
        this.extension = NstSvcFileType.getSuffix(model.filename);
        this.type = NstSvcFileType.getType(model.mimetype);
        this.size = model.size;
        this.date = moment(model.uploadTime);
        this.hasPreview = model.hasPreview();
        this.preview = model.hasPreview() ? model.picture.getUrl("preview") : '';

      } else if (model instanceof NstVmFile) {
        this.id = model.id;
        this.name = model.name;
        this.extension = model.extension;
        this.type = model.type;
        this.size = model.size;
        this.date = model.date;
        this.preview = model.preview;
        this.hasPreview = model.hasPreview;

      } else  {
        throw Error('Could not create a view-model from an unsupported type');
      }
    }

    return VmFileViewerItem;
  }
})();
