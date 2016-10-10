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

    (function() {

      vm.mentions = $stateParams.mentions;
      if (!(_.isArray(vm.mentions) && vm.mentions.length > 0)) {
        NstSvcMentionFactory.getMentions().then(function(mentions) {
          vm.mentions = mentions;
        }).catch(function(error) {
          $log.error(error);
        });
      }

    })();
  }

})();
