(function () {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcInvitationFactory', NstSvcInvitationFactory);

  /** @ngInject */
  function NstSvcInvitationFactory($q, $log, _, moment,
                             NstSvcInvitationStorage, WsService,
                             NstFactoryError, NstFactoryQuery, NstInvitation) {

    /**
     * PostFactory - all operations related to activity
     */
    var service = {
      get : get,
      accept : accept,
      decline : decline,
    };

    return service;

    function parseInvitation(data) {
      var defer = $q.defer();

      var invitation = createInvitation();

      if (!data){
        defer.resolve(invitation);
      }
      else {

        invitation.id = data._id.$oid;
        invitation.role = data.role;

        $q.all([
          NstSvcUserFactory.get(data.invitee),
          NstSvcUserFactory.get(data.inviter),
          NstSvcPlaceFactory.get(data.place)
        ]).then(function (values) {
          invitation.invitee = values[0];
          invitation.inviter = values[1];
          invitation.place = values[2];

          defer.resolve(invitation);
        }).catch(defer.reject);
      }

      return defer.promise;
    }

    function createInvitation() {
      return new NstInvitation();
    }

    function get() {
      var defer = $q.defer();

      WsService.request('account/get_invitation', { invite_id: this.id }).then(function (response) {
        // TODO: parse the response and return an object
      }).catch(defer.reject);

      return defer.promise;
    }

    function accept(id) {
        var defer = $q.defer();

        WsService.request('account/update_invitation', {
          invite_id: id,
          state: 'accepted'
        }).then(function (response) {
          // TODO: parse the response and return an object
        }).catch(defer.reject)

        return defer.promise;
    }

    function decline(id) {
      var defer = $q.defer();

      WsService.request('account/update_invitation', {
        invite_id: id,
        state: 'ignored'
      }).then(function (response) {
        // TODO: parse the response and return an object
      }).catch(defer.reject)

      return defer.promise;
    }

  }
})();
