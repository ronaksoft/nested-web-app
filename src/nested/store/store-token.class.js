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
      this.expiration = null;

    }

    Token.prototype = {};
    Token.prototype.constructor = Token;

    Token.prototype.isExpired = function () {
      return true;
    };

    Token.prototype.toString = function () {
      return this.getString() || '';
    };

    return Token;
  }
})();
