(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NestedRecipient', function (WsService) {
      function Recipient(data) {
        this.username = null;
        this.email = null;
        this.email_verified = false;
        this.registered = false;
        this.phone = null;
        this.name = {
          fname: null,
          lname: null
        };
        this.fullname = null;
        this.picture = {
          org: null,
          x32: null,
          x64: null,
          x128: null
        };

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
          } else if (data.hasOwnProperty('status')) {
            this.username = data.info._id;
            this.email = data.info.email;
            this.email_verified = data.info.email_verified;
            this.phone = data.info.phone;
            this.name = {
              fname: data.info.fname,
              lname: data.info.lname
            };
            this.fullname = this.name.fname + ' ' + this.name.lname;
            this.picture = data.info.picture;
          }
        },

        load: function(username) {
          username = username || this.username;

          WsService.request('recipient/get', {
            account_id: username
          }).then(function (data) {
            this.setData(data);
          }.bind(this));
        },

        delete: function() {
          return WsService.request('recipient/remove', {
            post_id: this.id
          });
        },

        update: function() {
          // TODO: Check if API Exists and is correct
          return WsService.request('recipient/update', {
            post_id: this.id
          });
        }
      };

      return Recipient;
    });
})();
