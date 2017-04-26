(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmSelectTag', NstVmSelectTag);

  function NstVmSelectTag(NST_PATTERN) {

    function VmSelectTag(data) {
      this.id = data.id || null;
      this.name = data.name || data.id;
      if (_.isFunction(data.hasPicture) && data.hasPicture()) {
        this.picture = data.picture.getUrl('x32');
      } else {
        this.picture = '/assets/icons/absents_place.svg';
      }

      this.isEmail = NST_PATTERN.EMAIL.test(this.id);
      if (!this.isEmail){
        this.isValid = NST_PATTERN.SUB_PLACE_ID.test(this.id);
      }else{
        this.isValid = true;
    }


    }

    return VmSelectTag;
  }
})();
