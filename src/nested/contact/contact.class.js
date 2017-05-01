(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstContact', NstContact);

  function NstContact(NstTinyUser) {
    function Contact() {
      this.isFavorite = undefined;

      this.isContact = undefined;

      this.isMutual = undefined;

      NstTinyUser.call(this);
    }

    Contact.prototype = new NstTinyUser();
    Contact.prototype.constructor = Contact;

    return Contact;
  }
})();
