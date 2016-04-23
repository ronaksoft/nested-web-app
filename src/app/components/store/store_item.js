(function() {
  'use strict';

  angular
    .module('nested')
    .factory('StoreItem', StoreItem);

  /** @ngInject */
  function StoreItem(StoreService) {
    function Item(uid) {
      this.uid = uid;
      this.url = null;

      StoreService.toUrl(uid).then(function (url) {
        this.url = url;
      }.bind(this));
    }

    Item.prototype = {
    };

    return Item;
  }

})();
