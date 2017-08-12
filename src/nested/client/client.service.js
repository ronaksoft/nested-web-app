(function () {
  'use strict';

  angular
    .module('ronak.nested.web')
    .service('NstSvcClient', NstSvcClient);

  function NstSvcClient($cookies) {

    function Client() {
      this.serverTime = Date.now();
      this.timeDiff = 0;
    }

    Client.prototype = new Object();
    Client.prototype.constructor = Client;

    Client.prototype.getCid = function () {
      var cid = $cookies.get('ncid');
      if (!cid) {
        cid = ['web', 'desktop', platform.name, platform.os.family].join('_');
        this.setCid(cid);
      }

      return cid;
    };

    Client.prototype.setCid = function (cid) {
      if (!cid) {
        $cookies.remove('ncid');
        return;
      }

      $cookies.put('ncid', cid, { expires: getNextYear() });
    };

    function getNextYear() {
      var aYearFromNow = new Date();
      aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);

      return aYearFromNow;
    }

    Client.prototype.getDid = function () {
      const did = $cookies.get('ndid');
      if (did) {
        return did;
      }

      return 'web_' + Date.now() + '-' + guid() + '-' + guid();
    };

    function guid() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    Client.prototype.setDid = function (did) {
      if (!did) {
        $cookies.remove('ndid');
        return;
      }

      $cookies.put('ndid', did, { expires: getNextYear() });
    };

    Client.prototype.getDt = function () {
      return $cookies.get('ndt');
    }

    Client.prototype.setDt = function (dt) {
      if (!dt) {
        $cookies.remove('ndt');
        return;
      }

      $cookies.put('ndt', dt, { expires: getNextYear() });
    }

    Client.prototype.getDo = function () {
      return $cookies.get('ndo');
    }

    Client.prototype.setDo = function (dos) {
      if (!dos) {
        $cookies.remove('ndo');
        return;
      }

      $cookies.put('ndo', dos, { expires: getNextYear() });
    }

    return new Client();
  }
})();
