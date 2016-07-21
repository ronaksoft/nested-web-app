(function () {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcInvitationFactory', NstSvcInvitationFactory);

  /** @ngInject */
  function NstSvcInvitationFactory($q, $log, _, moment,
                                   NST_SRV_ERROR,
                                   NstSvcInvitationStorage, NstSvcServer, NstSvcUserFactory, NstSvcPlaceFactory,
                                   NstFactoryError, NstFactoryQuery, NstInvitation) {

    /**
     * PostFactory - all operations related to activity
     */
    var service = {
      getAll : getAll,
      get : get,
      accept : accept,
      decline : decline
    };

    return service;

    function parseInvitation(data) {
      var defer = $q.defer();

      var invitation = createInvitation();

      if (!data){
        defer.resolve(invitation);
      } else {
        invitation.setId(data._id.$oid);
        invitation.setRole(data.role);

        var invitee = NstSvcUserFactory.parseTinyUser(data.invitee);
        var inviter = NstSvcUserFactory.parseTinyUser(data.inviter);
        var place = NstSvcPlaceFactory.parseTinyPlace(data.place);
        NstSvcUserFactory.set(invitee);
        NstSvcUserFactory.set(inviter);
        NstSvcPlaceFactory.set(place);

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
    }

    function createInvitation() {
      return new NstInvitation();
    }

    function getAll() {
      var defer = $q.defer();

      NstSvcServer.request('account/get_invitations').then(function (response) {
        var promises = [];
        for (var k in response.invitations) {
          promises.push(parseInvitation(response.invitations[k]).catch(function (error) {
            return $q(function (res) {
              res(error);
            });
          }));
        }

        $q.all(promises).then(function (values) {
          var invitations = [];
          for (var k in values) {
            if (values[k] instanceof NstInvitation) {
              invitations.push(values[k]);
            }
          }

          defer.resolve(invitations);
        });
      }).catch(function (error) {
        defer.reject(new NstFactoryError(new NstFactoryQuery(), error.getMessage(), error.getCode(), error));
      });

      return defer.promise;
    }

    function get(id) {
      var defer = $q.defer();

      NstSvcServer.request('account/get_invitation', { invite_id: id }).then(function (response) {
        // TODO: parse the response and return an object
      }).catch(defer.reject);

      return defer.promise;
    }

    function accept(id) {
        var defer = $q.defer();

        NstSvcServer.request('account/update_invitation', {
          invite_id: id,
          state: 'accepted'
        }).then(function (response) {
          // TODO: parse the response and return an object
        }).catch(defer.reject);

        return defer.promise;
    }

    function decline(id) {
      var defer = $q.defer();

      NstSvcServer.request('account/update_invitation', {
        invite_id: id,
        state: 'ignored'
      }).then(function (response) {
        // TODO: parse the response and return an object
      }).catch(defer.reject);

      return defer.promise;
    }

  }
})();
