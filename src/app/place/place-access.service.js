(function() {
  'use strict';
  angular
    .module('ronak.nested.web.place')
    .service('NstSvcPlaceAccess', NstSvcPlaceAccess);

  /** @ngInject */
  function NstSvcPlaceAccess($q,
  NstSvcPlaceFactory,
  NST_PLACE_ACCESS) {

    var service = {
      getIfhasAccessToRead : getIfhasAccessToRead,
    };

    return service;
    // TODO: Do not use this service anymore
    function getIfhasAccessToRead(placeId) {
      return NstSvcPlaceFactory.get(placeId);
    }
  }
})();
