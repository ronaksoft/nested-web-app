(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .service('NstSvcInvitationFactory', NstSvcInvitationFactory);

  /** @ngInject */
  function NstSvcInvitationFactory($q, $log,
                                   NST_SRV_ERROR, NST_SRV_EVENT, NST_INVITATION_FACTORY_EVENT, NST_EVENT_ACTION, NST_PLACE_MEMBER_TYPE,
                                   NstSvcInvitationStorage, NstSvcServer, NstSvcUserFactory, NstSvcPlaceFactory,
                                   NstObservableObject, NstFactoryError, NstFactoryQuery, NstInvitation) {
    function InvitationFactory() {
      var factory = this;

      this.requests = {
        get: {},
        getAll: undefined,
        decide: {},
        getPendings: {}
      };

      NstSvcServer.addEventListener(NST_SRV_EVENT.TIMELINE, function (event) {
        var tlData = event.detail.timeline_data;

        switch (tlData.action) {
          case NST_EVENT_ACTION.MEMBER_INVITE:
            factory.get(tlData.invite_id.$oid).then(function (invitation) {
              factory.dispatchEvent(new CustomEvent(
                NST_INVITATION_FACTORY_EVENT.ADD,
                { detail: { id: invitation.getId(), invitation: invitation } }
              ));
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

                NstSvcInvitationStorage.set(invitation.getId(), invitation);
                invitations.push(invitation);
              }
            }

            defer.resolve(invitations);
          });
        }).catch(function (error) {
          defer.reject(new NstFactoryError(new NstFactoryQuery(), error.getMessage(), error.getCode(), error));
        });

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

    InvitationFactory.prototype.get = function (id) {
      var factory = this;

      if (!this.requests.get[id]) {
        var query = new NstFactoryQuery(id);

        this.requests.get[id] = $q(function (resolve, reject) {
          var invitation = NstSvcInvitationStorage.get(query.getId());
          if (invitation) {
            resolve(invitation);
          } else {
            NstSvcServer.request('account/get_invitation', {
              invite_id: query.getId()
            }).then(function (invitationData) {
              var invitation = factory.parseInvitation(invitationData.invitation);
              NstSvcInvitationStorage.set(query.getId(), invitation);
              resolve(invitation);
            }).catch(function(error) {
              reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
            });
          }
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
    };

    InvitationFactory.prototype.accept = function (id) {
      var factory = this;

      if (!this.requests.decide[id]) {
        var defer = $q.defer();
        var query = new NstFactoryQuery(id);

        this.get(id).then(function (invitation) {
          NstSvcServer.request('account/update_invitation', {
            invite_id: id,
            state: 'accepted'
          }).then(function (response) {
            // TODO: parse the response and return an object
            defer.resolve(invitation);
            factory.dispatchEvent(new CustomEvent(
              NST_INVITATION_FACTORY_EVENT.ACCEPT,
              { detail: { id: id, invitation: invitation } }
            ));
          }).catch(function (error) {
            defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
        }).catch(defer.reject);

        this.requests.decide[id] = defer.promise;
      }

      return this.requests.decide[id];
    };

    InvitationFactory.prototype.decline = function (id) {
      var factory = this;

      if (!this.requests.decide[id]) {
        var defer = $q.defer();
        var query = new NstFactoryQuery(id);

        this.get(id).then(function (invitation) {
          NstSvcServer.request('account/update_invitation', {
            invite_id: id,
            state: 'ignored'
          }).then(function (response) {
            // TODO: parse the response and return an object
            defer.resolve(invitation);
            factory.dispatchEvent(new CustomEvent(
              NST_INVITATION_FACTORY_EVENT.DECLINE,
              { detail: { id: id, invitation: invitation } }
            ));
          }).catch(function (error) {
            defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          });
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

      if (!data){
        defer.resolve(invitation);
      } else {
        invitation.setId(data._id.$oid);
        invitation.setRole(data.role);

        var invitee = NstSvcUserFactory.parseTinyUser();
        if (angular.isObject(data.invitee)) {
          invitee = NstSvcUserFactory.parseTinyUser(data.invitee);
          NstSvcUserFactory.set(invitee);
        } else if (data.invitee_id) {
          invitee.setId(data.invitee_id);
        }

        var inviter = NstSvcUserFactory.parseTinyUser();
        if (angular.isObject(data.inviter)) {
          inviter = NstSvcUserFactory.parseTinyUser(data.inviter);
          NstSvcUserFactory.set(inviter);
        } else if (data.inviter_id) {
          inviter.setId(data.inviter_id);
        }

        var place = NstSvcPlaceFactory.parseTinyPlace();
        if (angular.isObject(data.place)) {
          place = NstSvcPlaceFactory.parseTinyPlace(data.place);
          NstSvcPlaceFactory.set(place);
        } else if (data.place_id) {
          place.setId(data.place_id);
        }

        if (invitee.getId() && inviter.getId() && place.getId()) {
          $q.all([
            NstSvcUserFactory.getTiny(invitee.getId()),
            NstSvcUserFactory.getTiny(inviter.getId()),
            NstSvcPlaceFactory.getTiny(place.getId())
          ]).then(function (values) {
            invitation.setInvitee(values[0]);
            invitation.setInviter(values[1]);
            invitation.setPlace(values[2]);

            defer.resolve(invitation);
          }).catch(function (error) {
            defer.reject(new NstFactoryError(new NstFactoryQuery(), error.getMessage(), error.getCode(), error));
          });
        } else {
          defer.reject(new NstFactoryError(new NstFactoryQuery(), "Invalid", NST_SRV_ERROR.UNAVAILABLE));
        }
      }

      return defer.promise;
    };

    InvitationFactory.prototype.revoke = function (invitationId) {
      var defer = $q.defer();

      NstSvcServer.request('place/remove_invite', {
        invite_id : invitationId
      }).then(function (result) {
        defer.resolve(true);
      }).catch(function (error) {
        defer.reject(error);
      });

      return defer.promise;
    }

    InvitationFactory.prototype.getPlacePendingInvitations = function (placeId) {
      var factory = this;

      if (!this.requests.getPendings[placeId]) {
        var defer = $q.defer();
        var query = new NstFactoryQuery(placeId);

        // TODO: Ask server to merge these 2 request
        $q.all([
          NstSvcServer.request('place/get_pending_invitations', {
            place_id: placeId,
            member_type : NST_PLACE_MEMBER_TYPE.KEY_HOLDER
          }),
          NstSvcServer.request('place/get_pending_invitations', {
            place_id: placeId,
            member_type : NST_PLACE_MEMBER_TYPE.KNOWN_GUEST
          })
        ]).then(function (result) {

          var keyHolders = _.map(result[0].invitations, function (invitation) {
            return factory.parseInvitation(invitation);
          });

          var knownGuests = _.map(result[1].invitations, function (invitation) {
            return factory.parseInvitation(invitation);
          });

          var data = {};
          $q.all(keyHolders).then(function (keyholderInvitations) {
            data.pendingKeyHolders = keyholderInvitations;

            return $q.all(knownGuests);
          }).then(function (knownGuestInvitations) {
            data.pendingKnownGuests = knownGuestInvitations;

            defer.resolve(data);
          }).catch(defer.reject);


        }).catch(function (error) {
          defer.reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
          $log.debug(error);
        });

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

    return new InvitationFactory();
  }
})();
