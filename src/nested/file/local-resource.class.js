(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NstLocalResource', NstLocalResource);

  /** @ngInject */
  function NstLocalResource(NST_STORE_ROUTE, NST_OBJECT_EVENT, NstSvcStore, NstObservableObject) {
    /**
     * Creates an instance of NstStoreResource
     *
     * @param {String}  uri Resource URI
     *
     * @constructor
     */
    function LocalResource(uri) {
      /**
       * Resource Identifier
       *
       * @type {undefined|String}
       */
      this.id = undefined;
      
      /**
       * Resource URI
       *
       * @type {undefined|String}
       */
      this.uri = undefined;

      /**
       * Resource urls
       *
       * @type {Object}
       */
      this.url = {
        download: "",
        view: "",
        stream: ""
      };

      NstObservableObject.call(this);

      this.addEventListener(NST_OBJECT_EVENT.CHANGE, function (event) {
        switch (event.detail.name) {
          case 'id':
            this.setUri(event.detail.newValue);
            break;
          
          case 'uri':
            this.refreshUrls();
            break;
        }
      });

      this.setId(uri);
      this.setUri(uri);
    }

    LocalResource.prototype = new NstObservableObject();
    LocalResource.prototype.constructor = LocalResource;

    LocalResource.prototype.refreshUrls = function () {
      this.url.download = this.getUri();
      this.url.view = this.getUri();
      this.url.stream = this.getUri();
    };

    return LocalResource;
  }
})();
