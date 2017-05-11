(function () {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('ActiveSessionsController', ActiveSessionsController);

  /** @ngInject */
  function ActiveSessionsController(_, toastr, NstSvcAuth, NstSvcTranslation) {
    var vm = this;
    vm.sessions = [];
    vm.loading = false;
    vm.terminate = terminate;

    (function () {
      getAllSessions();
    })();

    function getAllSessions() {
      vm.loading = true;
      NstSvcAuth.getSessions()
        .then(function (sessions) {
          vm.loading = false;
          vm.sessions = sessions;
        });
    }

    function terminate(sk) {
      NstSvcAuth.terminateSession(sk)
        .then(function () {
          var indexOfSession = _.findIndex(vm.sessions, function (session) {
            return session.sk === sk;
          });

          vm.sessions.splice(indexOfSession, 1);
          toastr.success(NstSvcTranslation.get("Session terminated successfully."));
        })
        .catch(function () {
          toastr.error(NstSvcTranslation.get("Problem in terminate session."));
        });
    }

  }
})();
