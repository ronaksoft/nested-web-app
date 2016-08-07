(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NstStoreToken', NstStoreToken);

  /** @ngInject */
  function NstStoreToken(NstObservableObject) {
    /**
     * Creates an instance of NstStoreToken
     *
     * @param {String}      string      Token string
     * @param {Number|Date} expiration  Token expiration date
     *
     * @constructor
     */
    function Token(string, expiration) {
      this.string = undefined;
      this.expiration = new Date();

      NstObservableObject.call(this);

      this.setString(string);
      this.setExpiration(expiration);
    }

    Token.prototype = new NstObservableObject();
    Token.prototype.constructor = Token;

    Token.prototype.isExpired = function () {
      return Date.now() > this.expiration.valueOf();
    };

    Token.prototype.toString = function () {
      return this.getString() || '';
    };

    return Token;
  }
})();
