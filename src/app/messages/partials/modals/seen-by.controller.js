(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('SeenByController', SeenByController);

  function SeenByController(toastr, _,
                            NstSvcPostFactory,
                            postId) {
    var vm = this,
      limit = 8;

    vm.loading = false;
    vm.readers = [];
    (function () {
      loadWhoSeen();
    })();


    function loadWhoSeen() {
      if (vm.loading) return;
      vm.loading = true;
      NstSvcPostFactory.whoRead(postId, vm.readers.length, limit)
        .then(function (readers) {
          vm.readers = _.concat(vm.readers, readers);
          console.log(vm.readers )
          vm.loading = false;
        })
        .catch(function () {
          vm.loading = false;
        })
    }

  }

})();
