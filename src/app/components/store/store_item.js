(function() {
  'use strict';

  angular
    .module('nested')
    .factory('StoreItem', StoreItem);

  /** @ngInject */
  function StoreItem($sce, $q, StoreService) {
    function Item(uid, token) {
      if (uid instanceof Item) {
        angular.extend(this, uid);
      } else {
        this.uid = uid;
        this.token = token;
        this.url = null;
      }

      this.uid && this.getUrl();
    }

    Item.prototype = {
      getUrl: function () {
        return StoreService.toUrl(this.uid, this.token).then(function (url) {
          this.url = $sce.trustAsResourceUrl(url).toString();

          return $q(function (res) {
            res(this.url);
          }.bind(this));
        }.bind(this));
      }
    };

    return Item;
  }

})();
