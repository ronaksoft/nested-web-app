(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NestedInvitation', function ($rootScope, $q, $log, NstSvcServer, NestedUser, MEMBER_TYPE, NestedPlace) {
      function Invitation(data, full) {
        this.full = full || false;

        this.id = null;
        this.invitee = new NestedUser();
        this.inviter = new NestedUser();
        this.place = new NestedPlace();
        this.role = null;

        if (data) {
          this.setData(data);
        }
      }

      Invitation.prototype = {
        setData: function(data) {
          if (angular.isString(data)) {
            return this.load(data);
          } else if (data.hasOwnProperty('id')) {
            angular.extend(this, data);

            this.change();
          } else if (data.hasOwnProperty('_id')) {
            $log.debug('Invitation Data', data);
            this.id = data._id.$oid;
            this.invitee.setData(data.invitee);
            this.inviter.setData(data.inviter);
            this.place.setData(data.place);
            this.role = data.role;

            this.change();
          } else if (data.hasOwnProperty('status')) {
            this.setData(data.invitation);
          }

          return $q(function (res) {
            res(this);
          }.bind(this));
        },

        change: function () {
          if(!$rootScope.$$phase) {
            $rootScope.$digest()
          }
        },

        load: function(id) {
          this.id = id || this.id;

          return NstSvcServer.request('account/get_invitation', { invite_id: this.id }).then(this.setData.bind(this));
        },

        accept: function () {
          return this.update(true);
        },

        decline: function () {
          return this.update(false);
        },

        update: function(accept) {
          if (this.id) {
            return NstSvcServer.request('account/update_invitation', {
              invite_id: this.id,
              state: accept ? 'accepted' : 'ignored'
            }).then(function () {
              return $q(function (res) {
                res(this);
              }.bind(this));
            }.bind(this));
          }

          return $q(function (res, rej) {
            rej();
          });
        }
      };

      return Invitation;
    });
})();
