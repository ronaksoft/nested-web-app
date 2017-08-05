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

      this.isPublic = undefined;
    }

    Label.prototype = {};
    Label.prototype.constructor = Label;

    return Label;
  }
})();
