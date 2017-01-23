(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstTinyPlace', NstTinyPlace);

  /** @ngInject */
  function NstTinyPlace(_, NstModel) {
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
       * Place's Picture
       *
       * @type {undefined|NstPicture}
       */
      this.picture = undefined;

      /*****************************
       *****      Ancestors     ****
       *****************************/

      this.unreadPosts = undefined;

      this.totalPosts = undefined;

      this.teammatesCount = undefined;

      this.parentId = undefined;

      this.grandParentId = undefined;

      /*****************************
       *****      Descendant    ****
       *****************************/

      /**
       * Place's children
       *
       * @type {{ placeId: NstPlace, length: Number }}
       */
      this.children = {
        length: 0
      };

      this.accesses = undefined;

      NstModel.call(this);

      if (data) {
        this.fill(data);
      }
    }

    TinyPlace.prototype = new NstModel();
    TinyPlace.prototype.constructor = TinyPlace;

    TinyPlace.prototype.isGrandPlace = function () {
      return this.grandParentId !== this.id;
    }

    TinyPlace.prototype.hasParent = function () {
      return this.id && this.id.split('.').length > 0;
    }

    TinyPlace.prototype.hasGrandParent = function () {
      return this.grandParentId && this.grandParentId !== this.id;
    }

    TinyPlace.prototype.hasAccess = function (access) {
      return _.includes(this.accesses, access);
    }

    TinyPlace.prototype.hasPicture = function () {
      return this.picture && this.picture.original;
    }

    return TinyPlace;
  }
})();
