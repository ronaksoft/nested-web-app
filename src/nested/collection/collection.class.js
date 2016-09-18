(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
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
