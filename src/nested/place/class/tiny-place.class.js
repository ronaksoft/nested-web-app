(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstTinyPlace', NstTinyPlace);

  /** @ngInject */
  function NstTinyPlace(_) {
    /**
     * Creates an instance of NstTinyPlace.
     *
     * @param {string|Object} data    Place Info
     *
     * @constructor
     */
    function TinyPlace() {
      this.id = undefined;

      this.name = undefined;

      this.description = undefined;

      this.picture = undefined;

      this.accesses = undefined;
    }

    TinyPlace.prototype = {};
    TinyPlace.prototype.constructor = TinyPlace;

    TinyPlace.prototype.hasAccess = function (access) {
      return _.includes(this.accesses, access);
    }

    TinyPlace.prototype.hasPicture = function () {
      return this.picture && this.picture.preview;
    }

    return TinyPlace;
  }
})();
