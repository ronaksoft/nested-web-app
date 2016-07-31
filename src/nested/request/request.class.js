(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NstRequest', NstRequest);

  function NstRequest($q, NST_OBJECT_EVENT, NST_REQ_STATUS, NST_RES_STATUS, NstObservableObject, NstResponse) {
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

        if (!this.isFinished()) {
          if (NST_RES_STATUS.UNKNOWN != response.getStatus()) {
            this.setStatus(NST_REQ_STATUS.RESPONDED);
          }

          if (NST_RES_STATUS.SUCCESS == response.getStatus()) {
            deferred.resolve(response);
          } else {
            deferred.reject(response);
          }
        }
      };
    }

    Request.prototype = new NstObservableObject();
    Request.prototype.constructor = Request;

    Request.prototype.sent = function () {
      var deferred = $q.defer();

      if (this.isSent()) {
        deferred.resolve(this.getData());
      } else {
        var me = this;
        var lId = this.addEventListener(NST_OBJECT_EVENT.CHANGE, function (event) {
          switch (event.detail.name) {
            case 'status':
              if (Request.isSentStatus(event.detail.newValue)) {
                deferred.resolve(me.getData());
                me.removeEventListener(lId);
              }
              break;
          }
        });
      }

      return deferred.promise;
    };

    Request.prototype.finished = function () {
      var deferred = $q.defer();

      if (this.isFinished()) {
        deferred.resolve(this.getResponse());
      } else {
        var me = this;
        var lId = this.addEventListener(NST_OBJECT_EVENT.CHANGE, function (event) {
          switch (event.detail.name) {
            case 'status':
              if (Request.isFinishedStatus(event.detail.newValue)) {
                deferred.resolve(me.getResponse());
                me.removeEventListener(lId);
              }
              break;
          }
        });
      }

      return deferred.promise;
    };

    Request.prototype.cancelled = function () {
      var deferred = $q.defer();

      if (this.isCancelled()) {
        deferred.resolve(this.getResponse());
      } else {
        var me = this;
        var lId = this.addEventListener(NST_OBJECT_EVENT.CHANGE, function (event) {
          switch (event.detail.name) {
            case 'status':
              if (Request.isCancelledStatus(event.detail.newValue)) {
                deferred.resolve(me.getResponse());
                me.removeEventListener(lId);
              }
              break;
          }
        });
      }

      return deferred.promise;
    };

    Request.prototype.isSent = function () {
      return Request.isSentStatus(this.getStatus());
    };

    Request.prototype.isFinished = function () {
      return Request.isFinishedStatus(this.getStatus());
    };

    Request.prototype.isCancelled = function () {
      return Request.isCancelledStatus(this.getStatus());
    };

    Request.isSentStatus = function(status) {
      return [NST_REQ_STATUS.SENT, NST_REQ_STATUS.CANCELLED, NST_REQ_STATUS.RESPONDED].indexOf(status) > -1;
    };

    Request.isFinishedStatus = function(status) {
      return [NST_REQ_STATUS.CANCELLED, NST_REQ_STATUS.RESPONDED].indexOf(status) > -1;
    };

    Request.isCancelledStatus = function(status) {
      return [NST_REQ_STATUS.CANCELLED].indexOf(status) > -1;
    };

    return Request;
  }
})();
