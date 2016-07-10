(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NstPicture', NstPicture);

  /** @ngInject */
  function NstPicture(NST_OBJECT_EVENT, NstResource) {
    /**
     * Creates an instance of NstPicture
     *
     * @param {string}  universalId Main Picture Universal Identifier
     * @param {Object}  thumbnails  Thumbnail Pictures' Universal Identifiers: {<size>: <uid>}
     *
     * @constructor
     */
    function Picture(universalId, thumbnails) {
      /**
       * Main Picture Identifier
       *
       * @type {undefined|String}
       */
      this.id = undefined;

      /**
       * Main Picture Resource
       *
       * @type {NstResource}
       */
      this.org = new NstResource();

      /**
       * Picture Thumbnails' Resources
       *
       * @type {NstResource[]}
       */
      this.thumbnails = [];

      NstObservableObject.call(this);

      this.addEventListener(NST_OBJECT_EVENT.CHANGE, function (event) {
        console.log('Picture Event Listener Context: ', this);

        switch (event.detail.name) {
          case 'id':
            this.org.setId(this.id);
            break;
        }
      });

      this.setId(universalId);
      for (var k in thumbnails) {
        var size = Number(String(k).replace(/[a-zA-Z]*/g, ''));
        this.setThumbnail(size, new NstResource(thumbnails[k]));
      }
    }

    Picture.prototype = new NstObservableObject();
    Picture.prototype.constructor = Picture;

    /**
     * Sets thumbnail of a specific size
     *
     * @param {Number}      size      Thumbnail size
     * @param {NstResource} resource  Thumbnail resource
     *
     * @returns {Picture}
     */
    Picture.prototype.setThumbnail = function (size, resource) {
      var thumbnails = this.thumbnails;
      thumbnails['x' + size] = resource;

      return this.setThumbnails(thumbnails);
    };

    /**
     * Retrieves thumbnail of a specific size
     *
     * @param {Number} size
     *
     * @returns {NstResource}
     */
    Picture.prototype.getThumbnail = function (size) {
      return this.thumbnails['x' + size];
    };

    return Picture;
  }
})();
