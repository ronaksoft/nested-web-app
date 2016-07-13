(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NstTinyPlace', NstTinyPlace);

  /** @ngInject */
  function NstTinyPlace(NstModel) {
    /**
     * Creates an instance of NstTinyPlace. Do not use this directly, use NstSvcPlaceFactory.getTiny(data) instead
     *
     * @param {string|Object} data    Place Info
     *
     * @constructor
     */
    function TinyPlace(data) {
      /**
       * Place Identifier
       *
       * @type {undefined|String}
       */
      this.id = undefined;

      /**
       * Place's name
       *
       * @type {undefined|String}
       */
      this.name = undefined;

      /**
       * Place's description
       *
       * @type {undefined|String}
       */
      this.description = undefined;

      /**
       * Place's Picture
       *
       * @type {undefined|NstPicture}
       */
      this.picture = undefined;

      NstModel.call(this);

      if (data) {
        this.fill(data);
      }
    }

    TinyPlace.prototype = new NstModel();
    TinyPlace.prototype.constructor = TinyPlace;

    return TinyPlace;
  }
})();
