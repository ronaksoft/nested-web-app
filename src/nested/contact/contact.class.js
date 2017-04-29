(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstContact', NstContact);

  /** @ngInject */
  function NstContact() {
    function Contact(data) {
      this.id = null;

    }

    Contact.prototype = {};
    Contact.prototype.constructor = Contact;

    return Contact;
  }

})();
