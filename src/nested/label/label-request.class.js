(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstLabelRequest', NstLabelRequest);

  /** @ngInject */
  function NstLabelRequest() {
    function LabelRequest() {
      this.id = undefined;

      this.label = {};

      this.user = {};

      this.code = undefined;

      this.title = undefined;
    }

    LabelRequest.prototype = {};
    LabelRequest.prototype.constructor = LabelRequest;

    return LabelRequest;
  }
})();
