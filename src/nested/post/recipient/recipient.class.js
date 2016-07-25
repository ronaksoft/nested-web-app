(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NstRecipient', NstRecipient);

  function NstRecipient(NstObservableObject) {
    /**
     * Creates an instance of NstPostRecipient
     *
     * @param {string|Object} data  Recipient Info
     *
     * @constructor
     */
    function Recipient(data) {
      /**
       * Recipient's identifier
       *
       * @type {undefined|String}
       */
      this.id = undefined;
      
      /**
       * Recipient's email address
       *
       * @type {undefined|String}
       */
      this.email = undefined;

      /**
       * Recipient's name
       *
       * @type {undefined|String}
       */
      this.name = undefined;
      
      NstObservableObject.call(this);

      if (data) {
        this.fill(data);
      }
    }

    Recipient.prototype = new NstObservableObject();
    Recipient.prototype.constructor = Recipient;
    
    return Recipient;
  }
})();
