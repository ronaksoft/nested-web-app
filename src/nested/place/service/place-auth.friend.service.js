(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .service('NstSvcPlaceAuthFriend', NstSvcPlaceAuthFriend);

  function NstSvcPlaceAuthFriend(NST_AUTH_EVENT,
                                 NstSvcAuth, NstSvcMyPlaceIdStorage, NstSvcPlaceRoleStorage, NstSvcPlaceAccessStorage) {
    NstSvcAuth.addEventListener(NST_AUTH_EVENT.UNAUTHORIZE, function () {
      NstSvcMyPlaceIdStorage.flush();
      NstSvcPlaceRoleStorage.flush();
      NstSvcPlaceAccessStorage.flush();
    });
  }
})();
