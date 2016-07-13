(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NstStoreResource', NstStoreResource);

  /** @ngInject */
  function NstStoreResource(NST_STORE_ROUTE, NST_OBJECT_EVENT, NstSvcStore, NstObservableObject, NstStoreToken) {
    /**
     * Creates an instance of NstStoreResource
     *
     * @param {String}    universalId  Universal Identifier of Resource in Store
     * @param {NstStoreToken}  token        Token to download the resource
     *
     * @constructor
     */
    function StoreResource(universalId, token) {
      /**
       * Resource Identifier
       *
       * @type {undefined|String}
       */
      this.id = undefined;

      /**
       * Resource download token
       *
       * @type {undefined|NstStoreToken}
       */
      this.token = new NstStoreToken();

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
        console.log('Resource Event Listener Context: ', this);

        switch (event.detail.name) {
          case 'id':
          case 'token':
            this.refreshUrls();
            break;
        }

        if ('token' == event.detail.name) {
          // Check for token string change
          this.token.addEventListener(NST_OBJECT_EVENT.CHANGE, this.refreshUrls.bind(this));
        }
      });

      this.setId(universalId);
      token && this.setToken(token);
    }

    StoreResource.prototype = new NstObservableObject();
    StoreResource.prototype.constructor = StoreResource;

    StoreResource.prototype.refreshUrls = function () {
      this.url.download = NstSvcStore.resolveUrl(NST_STORE_ROUTE.DOWNLOAD, this.id, this.token);
      this.url.view = NstSvcStore.resolveUrl(NST_STORE_ROUTE.VIEW, this.id, this.token);
      this.url.stream = NstSvcStore.resolveUrl(NST_STORE_ROUTE.STREAM, this.id, this.token);
    };

    return StoreResource;
  }
})();
