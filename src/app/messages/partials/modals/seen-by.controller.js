(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('SeenByController', SeenByController);

  function SeenByController(toastr, _,
                            NstSvcPostFactory,
                            postId) {
    var vm = this,
      reached = false,
      limit = 8;

    vm.loading = false;
    vm.readers = [];

    vm.loadWhoSeen = loadWhoSeen;

    (function () {
      loadWhoSeen();
    })();


    function loadWhoSeen() {

      if (vm.loading || reached) return;
      vm.loading = true;
      NstSvcPostFactory.whoRead(postId, vm.readers.length, limit)
        .then(function (readers) {
          vm.loading = false;

          if (readers.length === 0 ) {
            reached = true;
            return;
          }
          vm.readers = _.concat(vm.readers, readers);
        })
        .catch(function () {
          vm.loading = false;
        })
    }

  }

})();
