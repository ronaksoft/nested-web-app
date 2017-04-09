(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmSelectTag', NstVmSelectTag);

  function NstVmSelectTag() {

    function VmSelectTag(data) {
      this.id = data.id || null;
      this.name = data.name || null;
      if (_.isFunction(data.hasPicture) && data.hasPicture()) {
        this.picture = data.picture.getUrl('x32');
      } else {
        this.picture = '/assets/icons/absents_place.svg';
      }
      this.isTag = false;
      this.isEmail = false;
      this.isValid = true;
    }

    return VmSelectTag;
  }
})();
