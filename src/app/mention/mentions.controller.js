(function() {
  'use strict';

  angular
    .module('ronak.nested.web.mention')
    .controller('MentionsController', MentionsController);

  function MentionsController($stateParams, $log, NstSvcMentionFactory, NstVmMention, NstSvcAuth) {
    var vm = this;

    vm.controls = {
      left: [],
      right: []
    };

    vm.markAllSeen = markAllSeen;

    (function() {

        NstSvcMentionFactory.getMentions().then(function(mentions) {
          vm.mentions = _.map(mentions, mapMention);
          console.log(vm.mentions);
        }).catch(function(error) {
          $log.error(error);
        });

    })();

    function markAllSeen() {

    }

    function mapMention(mention) {
      return new NstVmMention(mention, NstSvcAuth.user.id);
    }

  }

})();
