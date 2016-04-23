(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NestedUser', function (WsService, NestedUserRepoService, StoreItem) {
      function User(data) {
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

      User.prototype = {
        setData: function(data) {
          if (angular.isString(data)) {
            this.load(data);
          } else if (data.hasOwnProperty('username')) {
            angular.extend(this, data);
          } else if (data.hasOwnProperty('_id')) {
            this.username = data._id;
            this.email = data.email;
            this.email_verified = data.email_verified;
            this.phone = data.phone;
            this.name = {
              fname: data.fname,
              lname: data.lname,
              initials: data.fname.charAt(0).toUpperCase() + data.lname.charAt(0).toUpperCase()
            };
            this.fullname = this.name.fname + ' ' + this.name.lname;
            this.picture = {
              org: new StoreItem(data.picture.org),
              x32: new StoreItem(data.picture.x32),
              x64: new StoreItem(data.picture.x64),
              x128: new StoreItem(data.picture.x128)
            };
          } else if (data.hasOwnProperty('status')) {
            this.setData(data.info);
          }
        },

        load: function(username) {
          NestedUserRepoService.get(username || this.username).then(this.setData.bind(this));
        },

        delete: function() {
          return WsService.request('post/remove', {
            post_id: this.id
          });
        },

        update: function() {
          // TODO: Check if API Exists and is correct
          return WsService.request('post/update', {
            post_id: this.id
          });
        }
      };

      return User;
    });
})();
