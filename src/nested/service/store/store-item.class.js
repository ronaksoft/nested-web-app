(function() {
  'use strict';

  angular
    .module('nested')
    .factory('StoreItem', StoreItem);

  /** @ngInject */
  function StoreItem($sce, $q, NstSvcStore, NestedStore) {
    function Item(uid) {
      if (uid instanceof Item) {
        angular.extend(this, uid);
      } else {
        this.store = new NestedStore();
        this.uid = uid;
        this.url = null;
      }

      if (this.uid) {
        NstSvcStore.getStoreByUid(this.uid).then(function (store) {
          this.store = store;
        }.bind(this));

        this.getUrl();
      }
    }

    Item.prototype = {
      getUrl: function (token) {
        return NstSvcStore.toUrl(this.uid, token).then(function (url) {
          this.url = $sce.trustAsResourceUrl(url);

          return $q(function (res) {
            res(this.url);
          }.bind(this));
        }.bind(this));
      }
    };

    return Item;
  }
})();
