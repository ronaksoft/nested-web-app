(function () {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('ActiveSessionsController', ActiveSessionsController);

  /** @ngInject */
  /**
   * Shows the user active sessions and lets her terminate them
   * 
   * @param {any} _ 
   * @param {any} toastr 
   * @param {any} NstSvcAuth 
   * @param {any} NstSvcTranslation 
   */
  function ActiveSessionsController(_, toastr, NstSvcAuth, NstSvcTranslation) {
    var vm = this;
    vm.sessions = [];
    vm.loading = false;
    vm.terminate = terminate;

    (function () {
      getAllSessions();
    })();

    /**
     * Retrieves a list of all sessions
     * 
     */
    function getAllSessions() {
      vm.loading = true;
      NstSvcAuth.getSessions()
        .then(function (sessions) {
          vm.loading = false;
          vm.sessions = sessions;
        });
    }

    /**
     * Terminates a session and removes from the list
     * 
     * @param {any} sk 
     */
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
