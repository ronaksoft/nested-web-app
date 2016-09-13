(function() {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstResponse', NstResponse);

  function NstResponse(NST_RES_STATUS, NstObservableObject) {
    function Response(status, data) {
      this.status = status || NST_RES_STATUS.UNKNOWN;
      this.data = data;

      NstObservableObject.call(this);
    }

    Response.prototype = new NstObservableObject();
    Response.prototype.constructor = Response;

    return Response;
  }
})();
