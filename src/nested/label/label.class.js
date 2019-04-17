(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstLabel', NstLabel);

  /** @ngInject */
  function NstLabel() {
    function Label() {
      this.id = undefined;

      this.title = undefined;

      this.code = undefined;

      this.public = undefined;

      this.counters = {};

      this.topMembers = [];

      this.isMember = undefined;
    }

    Label.prototype = {};
    Label.prototype.constructor = Label;

    return Label;
  }
})();
