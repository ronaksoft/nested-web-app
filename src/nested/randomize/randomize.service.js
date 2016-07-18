(function () {
  'use strict';

  angular
    .module('nested')
    .service('NstSvcRandomize', NstSvcRandomize);

  /** @ngInject */
  function NstSvcRandomize() {
    function Randomize(mixrate) {
      this.mixrate = mixrate || 10000;
    }

    Randomize.prototype = {
      genUniqId: function (length, mixrate) {
        length = length || 20;
        mixrate = mixrate || this.mixrate;

        // TODO: Apply mixrate
        var timestamp = Date.now().toString();
        return timestamp.substr(0, Math.min(length, timestamp.length)) +
          Math.round(Math.random() * Math.pow(10, Math.max(length - timestamp.length, 0))).toString();
      }
    };

    return new Randomize();
  }
})();
