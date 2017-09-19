(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .service('NstSvcInvitationFactory', NstSvcInvitationFactory);

  /** @ngInject */
  function NstSvcInvitationFactory($q, $log, _, $rootScope,
                                   NST_SRV_EVENT, NST_INVITATION_EVENT, NST_EVENT_ACTION, NST_PLACE_MEMBER_TYPE, NST_STORAGE_TYPE, NST_INVITATION_FACTORY_STATE,
                                   NstSvcServer, NstSvcUserFactory, NstSvcPlaceFactory, NstSvcNotification,
                                   NstObservableObject, NstInvitation, NstStorage, NstCollector, NST_SRV_ERROR, NST_NOTIFICATION_TYPE) {
    function InvitationFactory() {
      var factory = this;

      this.requests = {
        get: {},
        getAll: undefined,
        decide: {},
        getPendings: {}
      };

      this.collector = new NstCollector('invitation', this.getMany);

      NstSvcServer.addEventListener(NST_SRV_EVENT.TIMELINE, function (event) {
        var tlData = event.detail.timeline_data;

        switch (tlData.action) {
          case NST_EVENT_ACTION.MEMBER_INVITE:
            factory.get(tlData.invite_id).then(function (invitation) {
              NstSvcNotification.push(tlData.invite_id);
              $rootScope.$broadcast(NST_INVITATION_EVENT.ADD, { invitationId: invitation.getId(), invitation: invitation });
            });
            break;
        }
      });
    }

    InvitationFactory.prototype = new NstObservableObject();
    InvitationFactory.prototype.constructor = InvitationFactory;

    InvitationFactory.prototype.getAll = function () {
      var factory = this;

      if (!this.requests.getAll) {
        var defer = $q.defer();

        NstSvcServer.request('account/get_invitations').then(function (response) {
          var promises = [];
          for (var k in response.invitations) {
            promises.push(factory.parseInvitation(response.invitations[k]).catch(function (error) {
              return $q(function (res) {
                res(error);
              });
            }));
          }

          $q.all(promises).then(function (values) {
            var invitations = [];
            for (var k in values) {
              if (values[k] instanceof NstInvitation) {
                var invitation = values[k];

                invitations.push(invitation);
              }
            }

            defer.resolve(invitations);
          });
        }).catch(defer.reject);

        this.requests.getAll = defer.promise;
      }

      return this.requests.getAll.then(function () {
        var args = arguments;
        factory.requests.getAll = undefined;

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        factory.requests.getAll = undefined;

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
    };

    InvitationFactory.prototype.getMany = function (id) {
      var joinedIds = id.join(',');
      return NstSvcServer.request('account/get_many_invitation', {
        account_id: joinedIds
      }).then(function (data) {
        return $q.resolve({
          idKey: '_id',
          resolves: data.accounts,
          rejects: data.no_access
        });
      });
    };

    InvitationFactory.prototype.get = function (id) {
      var factory = this;
      // TODO: Use sentinel to watch the request
      if (!this.requests.get[id]) {
        this.requests.get[id] = $q(function (resolve, reject) {

          NstSvcServer.request('account/get_invitation', {
            invite_id: id
          }).then(function (invitationData) {
            var invitation = factory.parseInvitation(invitationData);
            resolve(invitation);
          }).catch(reject);

        });
      }

      return this.requests.get[id].then(function () {
        var args = arguments;
        delete factory.requests.get[id];

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        delete factory.requests.get[id];

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });

      // var factory = this;
      // var deferred = $q.defer();
      // this.collector.add(id).then(function (data) {
      //     deferred.resolve(factory.parseInvitation(data));
      // }).catch(function (error) {
      //   switch (error.code) {
      //     case NST_SRV_ERROR.ACCESS_DENIED:
      //     case NST_SRV_ERROR.UNAVAILABLE:
      //         deferred.reject();
      //       break;
      //
      //     default:
      //         deferred.reject(error);
      //       break;
      //   }
      // });
      //
      // return deferred.promise;
    };

    InvitationFactory.prototype.accept = function (id) {
      if (!this.requests.decide[id]) {
        var defer = $q.defer();

        this.get(id).then(function (invitation) {
          NstSvcServer.request('account/respond_invite', {
            invite_id: id,
            response: 'accept'
          }).then(function () {
            // TODO: parse the response and return an object
            NstSvcPlaceFactory.get(invitation.place.id, true).then(function () {
              defer.resolve(invitation);
            });
            $rootScope.$broadcast(NST_INVITATION_EVENT.ACCEPT, { invitationId: id, invitation: invitation });
          }).catch(defer.reject);
        }).catch(defer.reject);

        this.requests.decide[id] = defer.promise;
      }

      return this.requests.decide[id];
    };

    InvitationFactory.prototype.decline = function (id) {
      if (!this.requests.decide[id]) {
        var defer = $q.defer();

        this.get(id).then(function (invitation) {
          NstSvcServer.request('account/respond_invite', {
            invite_id: id,
            response: 'ignore'
          }).then(function () {
            $rootScope.$broadcast(NST_INVITATION_EVENT.DECLINE, { invitationId: id, invitation: invitation });
            defer.resolve(invitation);
          }).catch(defer.reject);
        }).catch(defer.reject);

        this.requests.decide[id] = defer.promise;
      }

      return this.requests.decide[id];
    };

    InvitationFactory.prototype.createInvitation = function () {
      return new NstInvitation();
    };

    InvitationFactory.prototype.parseInvitation = function (data) {
      var defer = $q.defer();

      var invitation = this.createInvitation();

      if (!data) {
        defer.resolve(invitation);
      } else {
        invitation.id = data._id;
        invitation.role = data.role;

        invitation.state = data.state || NST_INVITATION_FACTORY_STATE.PENDING;

        var invitee = null;
        if (angular.isObject(data.invitee)) {
          NstSvcUserFactory.set(data.invitee);
          invitee = NstSvcUserFactory.parseTinyUser(data.invitee);
        } else if (data.invitee_id) {
          invitee.id = data.invitee_id;
        }

        var inviter = null;
        if (angular.isObject(data.inviter)) {
          NstSvcUserFactory.set(data.inviter);
          inviter = NstSvcUserFactory.parseTinyUser(data.inviter);
        } else if (data.inviter_id) {
          inviter.id = data.inviter_id;
        }

        var place = null;
        if (angular.isObject(data.place)) {
          place = NstSvcPlaceFactory.parseTinyPlace(data.place);
          NstSvcPlaceFactory.set(data.place);
        } else if (data.place_id) {
          place.setId(data.place_id);
        }

        $q.all([
          NstSvcUserFactory.get(invitee.id),
          NstSvcUserFactory.get(inviter.id),
          NstSvcPlaceFactory.get(place.id)
        ]).then(function (values) {
          invitation.invitee = values[0];
          invitation.inviter = values[1];
          invitation.place = values[2];
          defer.resolve(invitation);
        }).catch(defer.reject);
      }

      return defer.promise;
    };

    InvitationFactory.prototype.revoke = function (invitationId) {
      var defer = $q.defer();

      NstSvcServer.request('place/remove_invite', {
        invite_id: invitationId
      }).then(function () {
        defer.resolve(true);
      }).catch(function (error) {
        defer.reject(error);
      });

      return defer.promise;
    }

    InvitationFactory.prototype.getPlacePendingInvitations = function (placeId, limit, skip) {
      var factory = this;

      if (!this.requests.getPendings[placeId]) {
        var defer = $q.defer();

        NstSvcServer.request('place/get_invitations', {
          place_id: placeId,
          member_type: NST_PLACE_MEMBER_TYPE.KEY_HOLDER,
          limit: limit,
          skip: skip
        }).then(function (result) {
          var keyHolders = _.map(result.invitations, function (invitation) {
            return factory.parseInvitation(invitation);
          });

          $q.all(keyHolders).then(function (keyholderInvitations) {

            defer.resolve(keyholderInvitations);
          }).catch(defer.reject);
        }).catch(defer.reject);

        this.requests.getPendings[placeId] = defer.promise;
      }

      return this.requests.getPendings[placeId].then(function () {
        var args = arguments;
        delete factory.requests.getPendings[placeId];

        return $q(function (res) {
          res.apply(null, args);
        });
      }).catch(function () {
        var args = arguments;
        delete factory.requests.getPendings[placeId];

        return $q(function (res, rej) {
          rej.apply(null, args);
        });
      });
    };

    InvitationFactory.prototype.storeDisplayedInvitations = function (invitationId) {
      var storage = new NstStorage(NST_STORAGE_TYPE.LOCAL, 'DisplayedInvitations');
      var displayed = storage.get('ids');
      var displayedArray = [];
      if (displayed) {
        displayedArray = displayed;
      }

      if (!_.includes(displayedArray, invitationId)) {
        displayedArray.push(invitationId)
        storage.set('ids', displayedArray);
        return true;
      } else {
        return false;
      }

    };

    return new InvitationFactory();
  }
})();
