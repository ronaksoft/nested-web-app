(function() {
  'use strict';

  angular
    .module('ronak.nested.web.mention')
    .controller('MentionsController', MentionsController);

  function MentionsController($stateParams,
    $log,
    NstSvcMentionFactory) {
    var vm = this;

    vm.controls = {
      left: [],
      right: []
    };

    vm.markAllSeen = markAllSeen;

    (function() {

        NstSvcMentionFactory.getMentions().then(function(mentions) {
          vm.mentions = mentions;
        }).catch(function(error) {
          $log.error(error);
        });

    })();
    function markAllSeen() {

    }

  }

})();
