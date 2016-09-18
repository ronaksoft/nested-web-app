(function() {
  'use strict';
  angular
    .module('ronak.nested.web.data')
    .factory('NstServerQuery', NstServerQuery);

  /** @ngInject */
  function NstServerQuery(NstObject) {
    function ServerQuery(id, data) {
      this.id = id;
      this.data = data;

      NstObject.call(this);
    }

    ServerQuery.prototype = new NstObject();
    ServerQuery.prototype.constructor = ServerQuery;

    return ServerQuery;
  }
})();
