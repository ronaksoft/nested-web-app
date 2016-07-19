(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NstRequest', NstRequest);

  function NstRequest($q, NST_REQ_STATUS, NST_RES_STATUS, NstResponse, NstObservableObject) {
    function Request(method, data) {
      this.method = method;
      this.data = data;
      this.status = NST_REQ_STATUS.NOT_SENT;
      this.response = new NstResponse();

      var deferred = $q.defer();
      this.promise = deferred.promise;

      NstObservableObject.call(this);

      this.finish = function (response) {
        this.setResponse(response);

        if (NST_RES_STATUS.UNKNOWN != response.getStatus()) {
          this.setStatus(NST_REQ_STATUS.RESPONDED);
        }

        if (NST_RES_STATUS.SUCCESS == response.getStatus()) {
          deferred.resolve(response);
        } else {
          deferred.reject(response);
        }
      };
    }

    Request.prototype = new NstObservableObject();
    Request.prototype.constructor = Request;

    Request.prototype.isFinished = function () {
      return [NST_REQ_STATUS.CANCELLED, NST_REQ_STATUS.RESPONDED].indexOf(this.getStatus()) > -1;
    };

    return Request;
  }
})();
