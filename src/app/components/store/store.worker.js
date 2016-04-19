(function() {
  'use strict';

  angular
    .module('nested')
    .factory('StoreWorker', NestedStoreWorker);

  /** @ngInject */
  function NestedStoreWorker($window, WsService, AuthService) {
    var fn = function () {
      self.addEventListener('message', function(event) {
        var cmd = event.data.cmd;
        switch (cmd) {
          case 'info':
            self.postMessage(JSON.stringify(['store/get_store_info', event.data.id]));
            break;
        }
      });
    };

    var blob = new Blob(['(' + fn.toString() + ')();'],{ type: 'application/javascript' });

    return new Worker(URL.createObjectURL(blob));
  }

})();
