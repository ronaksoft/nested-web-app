/**
 * @file src/nested/client/client.service.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Provides you getter and setter methods for the following client keys:
 *              cid, did, dt, do
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-015
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web')
    .service('NstSvcClient', NstSvcClient);

  /**
   * A set of tools to store and read client keys
   * 
   * @param {any} $cookies 
   * @returns 
   */
  function NstSvcClient($cookies) {

    /**
     * Creates an instance of NstSvcClient
     * 
     */
    function Client() {
      this.serverTime = Date.now();
      this.timeDiff = 0;
    }

    Client.prototype = new Object();
    Client.prototype.constructor = Client;

    /**
     * Returns the stored cid (client ID). Generates a new one if cid has not been stored before
     * 
     * @returns 
     */
    Client.prototype.getCid = function () {
      var cid = $cookies.get('ncid');
      if (!cid) {
        cid = ['web', 'desktop', platform.name, platform.os.family].join('_');
        this.setCid(cid);
      }

      return cid;
    };

    /**
     * Stores cid (client ID)
     * 
     * @param {any} cid 
     * @returns 
     */
    Client.prototype.setCid = function (cid) {
      if (!cid) {
        $cookies.remove('ncid');
        return;
      }

      $cookies.put('ncid', cid, { expires: getNextYear() });
    };

    /**
     * Calculates and returns the next year date from now
     * 
     * @returns 
     */
    function getNextYear() {
      var aYearFromNow = new Date();
      aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);

      return aYearFromNow;
    }

    /**
     * Returns the stored did. Generates a new one if it was not found
     * 
     * @returns 
     */
    Client.prototype.getDid = function () {
      const did = $cookies.get('ndid');
      if (did) {
        return did;
      }

      return 'web_' + Date.now() + '-' + guid() + '-' + guid();
    };

    /**
     * Generates a GUID
     * 
     * @returns 
     */
    function guid() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    /**
     * Stores the did (device ID)
     * 
     * @param {any} did 
     * @returns 
     */
    Client.prototype.setDid = function (did) {
      if (!did) {
        $cookies.remove('ndid');
        return;
      }

      $cookies.put('ndid', did, { expires: getNextYear() });
    };

    /**
     * Returns the stored dt (device token)
     * 
     * @returns 
     */
    Client.prototype.getDt = function () {
      return $cookies.get('ndt');
    }

    /**
     * Stores the given dt (device token)
     * 
     * @param {any} dt 
     * @returns 
     */
    Client.prototype.setDt = function (dt) {
      if (!dt) {
        $cookies.remove('ndt');
        return;
      }

      $cookies.put('ndt', dt, { expires: getNextYear() });
    }

    /**
     * Returns the stored do (device operating system)
     * 
     * @returns 
     */
    Client.prototype.getDo = function () {
      return $cookies.get('ndo');
    }

    /**
     * Stores the given do (device operating system)
     * 
     * @param {any} dos 
     * @returns 
     */
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
