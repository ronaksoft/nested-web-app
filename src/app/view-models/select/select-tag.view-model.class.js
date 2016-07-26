(function () {
  'use strict';

  angular
    .module('nested')
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

      if (data) {
        this.isTag = data.isTag || true;
        this.id = data.id;
        this.name = data.name;
        this.data = data.data;
      }
    }

    return VmSelectTag;
  }
})();
