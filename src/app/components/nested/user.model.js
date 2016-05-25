(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NestedUser', function ($q, WsService, NestedUserRepoService, StoreItem, $rootScope) {
      function User(data) {
        this.username = null;
        this.email = null;
        this.email_verified = false;
        this.registered = false;
        this.phone = null;
        this.name = {
          fname: null,
          lname: null,
          initials: null
        };
        this.fullname = null;
        this.picture = {
          org: new StoreItem(), // <StoreItem>
          x32: new StoreItem(),
          x64: new StoreItem(),
          x128: new StoreItem()
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

            this.change();
          } else if (data.hasOwnProperty('_id')) {
            this.username = data._id;
            this.email = data.email;
            this.email_verified = data.email_verified;
            this.phone = data.phone;
            this.name = {
              fname: data.fname || '',
              lname: data.lname || '',
              initials: ''
            };

            this.name.initials = this.name.fname.charAt(0).toUpperCase() + this.name.lname.charAt(0).toUpperCase();
            this.fullname = this.name.fname + ' ' + this.name.lname;

            if (data.picture) {
              this.picture = {
                org: new StoreItem(data.picture.org),
                x32: new StoreItem(data.picture.x32),
                x64: new StoreItem(data.picture.x64),
                x128: new StoreItem(data.picture.x128)
              };
            }

            this.change();
          } else if (data.hasOwnProperty('status')) {
            this.setData(data.info);
          }
        },

        change: function () {
          if(!$rootScope.$$phase) {
            $rootScope.$digest()
          }
        },

        load: function(username) {
          this.username = username || this.username;

          NestedUserRepoService.get(this.username).then(this.setData.bind(this));
        },

        delete: function() {
          return WsService.request('post/remove', {
            post_id: this.id
          });
        },

        setPicture: function(uid) {
          return WsService.request('account/set_picture', {
            universal_id: uid
          }).then(function () {
            this.picture.org = new StoreItem(uid);
            this.picture.x32 = this.picture.org;
            this.picture.x64 = this.picture.org;
            this.picture.x128 = this.picture.org;

            return $q(function (res) {
              res(this.picture);
            }.bind(this));
          }.bind(this));
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
