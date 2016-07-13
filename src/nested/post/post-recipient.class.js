(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NestedRecipient', function ($q, $rootScope, NstSvcServer) {
      function Recipient(data) {
        this.email = null;
        this.id = null;
        this.name = null;

        if (data) {
          this.setData(data);
        }

        // Some other initializations related to event
      }

      Recipient.prototype = {
        setData: function(data) {
          if (angular.isString(data)) {
            this.load(data);
          } else if (data.hasOwnProperty('id')) {
            angular.extend(this, data);

            this.change();
          } else if (data.hasOwnProperty('_id')) {
            this.id = data._id;
            this.email = this.id;
            this.name = data.name || this.id;

            this.change();
          } else if (data.hasOwnProperty('status')) {
            this.setData(data.info);
          }

          return this;
        },

        change: function () {
          if(!$rootScope.$$phase) {
            $rootScope.$digest()
          }
        },

        load: function(email) {
          this.email = email || this.email;

          return $q(function (resolve) { resolve({ _id: this.email }); }.bind(this)).then(this.setData.bind(this));
        },

        delete: function() {},

        update: function() {}
      };

      Recipient.EMAIL_REGEXP = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

      Recipient.isValidEmail = function (text) {
        return this.EMAIL_REGEXP.test(text);
      };

      return Recipient;
    });
})();
