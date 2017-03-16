(function() {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('NstSvcPostMap', NstSvcPostMap);

  /** @ngInject */
  function NstSvcPostMap(NstVmMessage, NstVmMessageSearchItem, NstVmPost) {

    var service = {
      toMessage: toMessage,
      toPost: toPost,
      toSearchMessageItem : toSearchMessageItem
    };

    return service;

    /*****************************
     *****  Implementations   ****
     *****************************/

    function toMessage(post, firstPlaceId, myPlaceIds) {
      return new NstVmMessage(post, firstPlaceId, myPlaceIds);
    }

    function toPost(post) {
      return new NstVmPost(post);
    }

    function toSearchMessageItem(post) {
      return new NstVmMessageSearchItem(post);
    }
  }

})();
