(function() {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstStoreToken', NstStoreToken);

  /** @ngInject */
  function NstStoreToken() {
    /**
     * Creates an instance of NstStoreToken
     *
     * @param {String}      string      Token string
     * @param {Number|Date} expiration  Token expiration date
     *
     * @constructor
     */
    function Token(string) {
      this.string = string;
      var expireTimeValue = getExpireTimeValue(string);
      this.expiration = _.isNumber(expireTimeValue) ? expireTimeValue : getTomorrowTimeValue();
    }

    Token.prototype = {};
    Token.prototype.constructor = Token;

    Token.prototype.isExpired = function () {
      return Date.now() >= this.expiration;
    };

    Token.prototype.toString = function () {
      return this.string;
    };

    function getExpireTimeValue(raw) {
      return Number(_.last(_.split(raw, "-")));
    }

    function getTomorrowTimeValue() {
      var now = new Date();

      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    }

    return Token;
  }
})();
