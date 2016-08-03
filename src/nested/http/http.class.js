(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NstHttp', NstHttp);

  function NstHttp($q, $http, _, NstObservableObject, NST_CONFIG, NST_REQ_STATUS, NST_RES_STATUS, NstResponse) {
    function HTTP(route, data, settings) {
      this.route = NST_CONFIG.REGISTER.AJAX.URL + route;
      this.data = data;
      this.status = NST_REQ_STATUS.NOT_SENT;
      this.response = new NstResponse();
      
      this.settings = {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      };
      if (angular.isObject(settings)) {
        this.settings = _.defaults(this.settings, settings);
      }

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

    HTTP.prototype = new NstObservableObject();
    HTTP.prototype.constructor = HTTP;

    HTTP.prototype.get = function () {
      var me = this;
      var deferred = $q.defer();
      var options = this.settings;
      options.params = this.data;

      $http.get(this.route, options).success(function (data, status, header, config) {
        me.setStatus(NST_RES_STATUS.SUCCESS);
        deferred.resolve(data.data);
      }).error(function (error) {
        me.setStatus(NST_RES_STATUS.FAILURE);
        deferred.reject(error);
      });

      return deferred.promise;
    };


    HTTP.prototype.post = function () {

      var me = this;
      var deferred = $q.defer();

      $http.post(this.route, this.data).success(function (data, status, header, config) {
        me.setStatus(NST_RES_STATUS.SUCCESS);
        deferred.resolve(data.data);
      }).error(function (error) {
        me.setStatus(NST_RES_STATUS.FAILURE);
        deferred.reject(error);
      });

      return deferred.promise;
    };


    HTTP.prototype.postJquery = function () {

      var me = this;
      var deferred = $q.defer();

      $.post(
        this.route,
        this.data,
        function (data) {
          me.setStatus(NST_RES_STATUS.SUCCESS);
          deferred.resolve(data.data);
        },
        function (error) {
          me.setStatus(NST_RES_STATUS.FAILURE);
          deferred.reject(error);
        }
      );

      return deferred.promise;
    };



    return HTTP;
  }
})();
