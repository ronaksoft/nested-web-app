(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstTinyPlace', NstTinyPlace);

  /** @ngInject */
  function NstTinyPlace(NST_OBJECT_EVENT, NstModel, NstPicture, NstStoreResource) {
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
      this.picture = new NstPicture();

      /*****************************
       *****      Ancestors     ****
       *****************************/

       this.unreadPosts = undefined;

       this.totalPosts = undefined;

       this.teammatesCount = undefined;

      /**
       * Place's parent
       *
       * @type {undefined|NstPlace}
       */
      this.parent = undefined;

      /**
       * Place's grand place
       *
       * @type {undefined|NstPlace}
       */
      this.grandParent = undefined;

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

      NstModel.call(this);

      if (data) {
        this.fill(data);
      }
    }

    TinyPlace.prototype = new NstModel();
    TinyPlace.prototype.constructor = TinyPlace;

    TinyPlace.prototype.setPicture = function (picture) {
      var oldValue = this.picture;

      if (picture instanceof NstPicture) {
        this.picture = picture;
      } else if (angular.isObject(picture)) {
        this.picture.setId(picture.org);
        var pictureClone = angular.copy(picture);
        delete pictureClone.org;

        for (var size in pictureClone) {
          this.picture.setThumbnail(size, new NstStoreResource(pictureClone[size]));
        }
      } else {
        return;
      }

      var event = new CustomEvent(NST_OBJECT_EVENT.CHANGE, {
        detail: {
          name: 'picture',
          newValue: this.picture,
          oldValue: oldValue,
          target: this
        }
      });
      this.dispatchEvent(event);
    };

    return TinyPlace;
  }
})();
