(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmSelectTag', NstVmSelectTag);

  function NstVmSelectTag() {
    /**
     * Creates an instance of NstVmSelectTag
     *
     * @param {{ id: {String}, name: {String}, isTag: {Boolean}, data: {*} }} data Tag Data
     *
     * @constructor
     */
    function VmSelectTag(data) {
      this.id = '';
      this.name = '';
      this.data = {};
      this.isTag = false;
      this.isEmail = false;
      this.isEmailValid = false;

      if (data) {
        this.isTag = data.isTag || true;
        this.id = data.id;
        this.name = data.name;
        this.data = data.data;
        this.isEmail = data.isEmail;
        this.isEmailValid = data.isEmailValid;
      }
    }

    return VmSelectTag;
  }
})();
