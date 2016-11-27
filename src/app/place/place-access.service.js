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

    function getIfhasAccessToRead(placeId) {
      var deferred = $q.defer();

      NstSvcPlaceFactory.hasAccess(placeId, NST_PLACE_ACCESS.READ_POST).then(function (has) {
        if (has) {
          NstSvcPlaceFactory.get(placeId).then(function (place) {
            deferred.resolve(place);
          }).catch(function (error) {
            if (error.code === 2) {
              deferred.resolve(null);
            } else {
              deferred.reject(error);
            }
          });
        } else {
          deferred.resolve(null);
        }
      }).catch(deferred.reject);

      return deferred.promise;
    }
  }
})();
