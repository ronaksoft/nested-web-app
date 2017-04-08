(function() {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('NstSvcPostMap', NstSvcPostMap);

  /** @ngInject */
  function NstSvcPostMap(NstVmMessage, NstVmMessageSearchItem) {

    var service = {
      toMessage: toMessage,
      toSearchMessageItem : toSearchMessageItem
    };

    return service;

    /*****************************
     *****  Implementations   ****
     *****************************/

    function toMessage(post, firstPlaceId, myPlaceIds) {
      return new NstVmMessage(post, firstPlaceId, myPlaceIds);
    }

    function toSearchMessageItem(post) {
      return new NstVmMessageSearchItem(post);
    }
  }

})();
