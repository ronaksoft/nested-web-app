(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmPlaceBadge', NstVmPlaceBadge);

  function NstVmPlaceBadge(NstTinyPlace, NstPlace, NstMicroPlace) {

    function VmPlaceBadge(model, thumbnailSize) {
      this.id = null;
      this.name = null;
      this.picture = null;

      if (model instanceof NstPlace || model instanceof NstTinyPlace || model instanceof NstMicroPlace) {
        this.id = model.id;
        this.name = model.name;
        this.picture = model.hasPicture() ? model.picture.getUrl(thumbnailSize || "x32") : '/assets/icons/absents_place.svg';

      } else {
        throw Error("Could not create a NstVmPlaceBadge from an unsupported type.");
      }
    }

    return VmPlaceBadge;
  }
})();
