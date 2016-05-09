(function() {
  'use strict';

  angular
    .module('nested')
    .factory('StoreItem', StoreItem);

  /** @ngInject */
  function StoreItem(StoreService, $sce) {
    function Item(uid, token) {
      this.uid = uid;
      this.token = token;
      this.url = null;

      uid && this.getUrl();
    }

    Item.prototype = {
      getUrl: function () {
        return StoreService.toUrl(this.uid, this.token).then(function (url) {
          this.url = $sce.trustAsResourceUrl(url);

          return this.url;
        }.bind(this));
      }
    };

    return Item;
  }

})();
