(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NstToken', NstToken);

  /** @ngInject */
  function NstToken(NstObservableObject) {
    /**
     * Creates an instance of NstToken
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
      return this.expiration > Date.now();
    };

    return Token;
  }
})();
