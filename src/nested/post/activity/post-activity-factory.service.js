(function () {
  'use strict';
  angular
    .module('ronak.nested.web.activity')
    .service('NstSvcPostActivityFactory', NstSvcPostActivityFactory);

  /** @ngInject */
  function NstSvcPostActivityFactory($q, $rootScope, _, NST_POST_EVENT_ACTION, NstSvcServer, NstSvcUserFactory,
                                     NstBaseFactory, NstSvcLabelFactory, NstCollector,
                                     NstUtility, NstSvcAttachmentFactory, NST_SRV_PUSH_CMD) {


    function ActivityFactory() {
      console.log('NstSvcPostActivityFactory');
      NstSvcServer.addEventListener(NST_SRV_PUSH_CMD.SYNC_POST_ACTIVITY, function (event) {
        var data = event.detail;
        $rootScope.$broadcast(NST_POST_EVENT_ACTION.SYNC_POST_ACTIVITY, {
          type: data.action,
          postId: data.post_id
        });
      });
    }

    ActivityFactory.prototype = new NstBaseFactory();
    ActivityFactory.prototype.constructor = ActivityFactory;

    var factory = new ActivityFactory();
    return factory;
  }
})();
