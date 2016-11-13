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
      this.thumbnail = null;
      this.hasThumbnail = null;
      this.isDownloaded = false;
      this.downloadUrl = null;
      this.mimeType = null;
      this.meta = {};

      if (model instanceof NstAttachment) {

        this.id = model.id;
        this.name = model.filename;
        this.extension = NstSvcFileType.getSuffix(model.filename);
        this.type = NstSvcFileType.getType(model.mimeType);
        this.size = model.size;
        this.date = moment(model.uploadTime);
        this.hasThumbnail = model.hasThumbnail();
        this.thumbnail = model.hasThumbnail() ? model.picture.getThumbnail(32).url.view : '';
        this.mimeType = model.mimeType;

      } else if (model instanceof NstVmFile) {

        this.id = model.id;
        this.name = model.name;
        this.extension = model.extension;
        this.type = model.type;
        this.size = model.size;
        this.date = model.date;
        this.thumbnail = model.thumbnail;
        this.mimeType = model.mimeType;

      } else  {
        throw Error('Could not create a view-model from an unsupported type');
      }
    }

    return VmFileViewerItem;
  }
})();
