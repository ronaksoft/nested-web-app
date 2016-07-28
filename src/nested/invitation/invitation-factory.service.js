(function () {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcInvitationFactory', NstSvcInvitationFactory);

  /** @ngInject */
  function NstSvcInvitationFactory($q, $log, _, moment,
                                   NST_SRV_ERROR,
                                   NstSvcInvitationStorage, NstSvcServer, NstSvcUserFactory, NstSvcPlaceFactory,
                                   NstObservableObject, NstFactoryError, NstFactoryQuery, NstInvitation) {
    function InvitationFactory() {
      this.requests = {
        get: {},
        decide: {}
      };
    }

    InvitationFactory.prototype = new NstObservableObject();
    InvitationFactory.prototype.constructor = InvitationFactory;

    InvitationFactory.prototype.getAll = function () {
      var factory = this;
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

      return defer.promise;
    };

    InvitationFactory.prototype.get = function (id) {
      var factory = this;

      if (!this.requests.get[id]) {
        var query = new NstFactoryQuery(id);

        // FIXME: Check whether if request should be removed on resolve/reject
        this.requests.get[id] = $q(function (resolve, reject) {
          var invitation = NstSvcInvitationStorage.get(query.getId());
          console.log('Got Invitation: ', query.getId(), invitation);
          if (invitation) {
            resolve(invitation);
          } else {
            NstSvcServer.request('account/get_invitation', {
              invite_id: query.getId()
            }).then(function (invitationData) {
              var invitation = factory.parseInvitation(invitationData.invitations);
              NstSvcInvitationStorage.set(query.getId(), invitation);
              resolve(invitation);
            }).catch(function(error) {
              // TODO: Handle error by type
              reject(new NstFactoryError(query, error.getMessage(), error.getCode(), error));
            });
          }
        });
      }

      return this.requests.get[id];
    };

    InvitationFactory.prototype.accept = function (id) {
      if (!this.requests.decide[id]) {
        var defer = $q.defer();

        NstSvcServer.request('account/update_invitation', {
          invite_id: id,
          state: 'accepted'
        }).then(function (response) {
          // TODO: parse the response and return an object
          defer.resolve(response);
        }).catch(defer.reject);

        this.requests.decide[id] = defer.promise;
      }

      return this.requests.decide[id];
    };

    InvitationFactory.prototype.decline = function (id) {
      if (!this.requests.decide[id]) {
        var defer = $q.defer();

        NstSvcServer.request('account/update_invitation', {
          invite_id: id,
          state: 'ignored'
        }).then(function (response) {
          // TODO: parse the response and return an object
          defer.resolve(response);
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

    return new InvitationFactory();
  }
})();
