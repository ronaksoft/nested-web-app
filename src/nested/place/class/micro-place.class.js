(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstMicroPlace', NstMicroPlace);

  /** @ngInject */
  function NstMicroPlace(NstModel) {

    function MicroPlace(data) {
      this.id = undefined;

      this.name = undefined;

      this.picture = undefined;

      this.accesses = undefined;

      NstModel.call(this);

      if (data) {
        this.fill(data);
      }
    }

    MicroPlace.prototype = new NstModel();
    MicroPlace.prototype.constructor = MicroPlace;

    MicroPlace.prototype.hasPicture = function () {
      return this.picture && this.picture.original;
    }

    return MicroPlace;
  }
})();
