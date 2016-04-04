(function() {
  'use strict';

  angular
    .module('nested')
    .constant('MESSAGE_TYPE', {
      quest: 'q',
      response: 'r'
    })
    .constant('RESPONSE_STATUS', {
      success: 'ok',
      error: 'err'
    })
    .service('WsService', ['$websocket', NestedWs]);

  /** @ngInject */
  function NestedWs($websocket) {
    this.stream = $websocket('wss://ws001.ws.nested.me:443');
  }

})();
