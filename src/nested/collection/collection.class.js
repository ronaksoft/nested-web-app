(function() {
  'use strict';

  angular
    .module('nested')
    .service('NstCollection', NstCollection);

  function NstCollection() {
    function Collection() {
      Array.apply(this, arguments);
    }

    Collection.prototype = [];
    Collection.prototype.constructor = Collection;

    return Collection;
  }
})();
