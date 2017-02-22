(function() {
  'use strict';
  angular
    .module('ronak.nested.web.place')
    .service('NstSvcPlaceAccess', NstSvcPlaceAccess);

  /** @ngInject */
  function NstSvcPlaceAccess($q,
  NstSvcPlaceFactory,
  NST_PLACE_ACCESS,
  NST_SRV_ERROR) {

    var service = {
      getIfhasAccessToRead : getIfhasAccessToRead,
    };

    return service;
    // TODO: Do not use this service anymore
    function getIfhasAccessToRead(placeId) {
      var deferred = $q.defer();

      NstSvcPlaceFactory.get(placeId).then(function (place) {
        var hasAccess = _.size(NstSvcPlaceFactory.filterPlacesByReadPostAccess([place])) > 0;
        if (hasAccess) {
          deferred.resolve(place);
        } else {
          deferred.resolve(null);
        }
      }).catch(function (error) {
        if (error.code === NST_SRV_ERROR.UNAVAILABLE) {
          deferred.resolve(null);
        } else {
          deferred.reject(error);
        }
      });

      return deferred.promise;
    }
  }
})();
