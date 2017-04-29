(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmSelectTag', NstVmSelectTag);

  function NstVmSelectTag(_, NST_PATTERN) {

    function VmSelectTag(data) {
      this.id = data.id || null;
      this.name = data.name || data.id;
      if (_.isFunction(data.hasPicture) && data.hasPicture()) {
        this.picture = data.picture.getUrl('x32');
      } else {
        this.picture = '/assets/icons/absents_place.svg';
      }

      this.isEmail = NST_PATTERN.EMAIL.test(this.id);

      if (this.id && !this.isEmail) {
        if (this.id.split('.').length === 1) {
          this.isValid = NST_PATTERN.GRAND_PLACE_ID.test(this.id);
        } else {
          var result = true;
          _.each(this.id.split('.'), function (part, index) {
            if (index === 0) {
              result = result && NST_PATTERN.GRAND_PLACE_ID.test(part);
            } else {
              result = result && NST_PATTERN.SUB_PLACE_ID.test(part);
            }
          });
          this.isValid = result;

        }

      } else {
        this.isValid = true;
      }


    }

    return VmSelectTag;
  }
})();
