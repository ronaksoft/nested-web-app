(function() {
  'use strict';
  angular
    .module('ronak.nested.web.data')
    .factory('NstServerQuery', NstServerQuery);

  /** @ngInject */
  function NstServerQuery() {
    function ServerQuery(id, data) {
      this.id = id;
      this.data = data;
    }

    ServerQuery.prototype = {};
    ServerQuery.prototype.constructor = ServerQuery;

    return ServerQuery;
  }
})();
