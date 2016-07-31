(function() {
  'use strict';

  angular.module('nested').factory('NstAttachment', NstAttachment);

  function NstAttachment(NST_ATTACHMENT_STATUS, NstModel, NstUser, NstPicture, NstLocalResource) {
    Attachment.prototype = new NstModel();
    Attachment.constructor = Attachment;

    function Attachment(data) {
      /**
       * Attachment's Identifier
       *
       * @type {String}
       */
      this.id = null;

      /**
       * TODO: Clarify requirement reason
       * Attachment's Post
       *
       * @type {NstPost}
       */
      this.post = undefined;

      /**
       * TODO: Clarify requirement reason
       * Attachment's Store's Identifier
       *
       * @type {String}
       */
      this.storeId = undefined;

      /**
       * Attachment's Status
       *
       * @type {NST_ATTACHMENT_STATUS}
       */
      this.status = NST_ATTACHMENT_STATUS.UNKNOWN;

      /**
       * Attachment's Places
       *
       * @type {NstPlace[]}
       */
      this.places = [];

      /**
       * Attachment's Uploader
       *
       * @type {NstUser}
       */
      this.uploader = new NstUser();

      /**
       * Attachment's Preview Picture
       *
       * @type {NstPicture}
       */
      this.picture = new NstPicture();

      /**
       * Attachment's Store Resource
       *
       * @type {NstStoreResource|NstLocalResource}
       */
      this.resource = new NstLocalResource();

      /**
       * Attachment's Upload Date
       *
       * @type {Date}
       */
      this.uploadTime = new Date(0);

      /**
       * Attachment's Download Times
       *
       * @type {Number}
       */
      this.downloads = -1;

      // TODO: Move below properties into NstFile

      /**
       * Attachment's Filename
       *
       * @type {String}
       */
      this.filename = null;

      /**
       * Attachment's Size
       *
       * @type {Number}
       */
      this.size = 0;

      /**
       * Attachment's Mime Type
       *
       * @type {Number}
       */
      this.mimeType = null;

      NstModel.call(this);

      if (data) {
        this.fill(data);
      }
    }

    Attachment.prototype.hasThumbnail = function(size) {
      return !!(this.getPicture().getId() || this.getPicture().getThumbnail(128 || size));
    };

    Attachment.prototype.addPlace = function(place) {
      var places = this.getPlaces();
      for (var k in places) {
        if (place.getId() == places[k].getId()) {
          places.splice(k, 1);
          break;
        }
      }
      places.push(place);
      
      return this.setPlaces(places);
    };

    Attachment.prototype.removePlace = function(id) {
      var places = this.getPlaces();
      var place = undefined;
      for (var k in places) {
        if (id == places[k].getId()) {
          place = places[k];
          places.splice(k, 1);
          break;
        }
      }

      if (place) {
        this.setPlaces(places);
      }
      
      return place;
    };

    // TODO: Move below actions somewhere else

    Attachment.prototype.getClientId = function() {
      if (!this.clientId) {
        // TODO: Not sure about clientId maybe it should be moved to somewhere like the related factory
        this.clientId = _.uniqueId('compose_attach_');
      }
      return this.clientId;
    };

    Attachment.prototype.setUploadCanceler = function(canceler) {
      this.canceler = canceler;
    };

    Attachment.prototype.cancelUpload = function() {
      if (this.canceler) {
        this.canceler();
        this.status = NST_ATTACHMENT_STATUS.ABORTED;
      }
    };

    return Attachment;
  }
})();
