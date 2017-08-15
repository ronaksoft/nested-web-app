(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcInteractionTracker', NstSvcInteractionTracker);

  /** @ngInject */
  function NstSvcInteractionTracker(Analytics, NST_CONFIG, $rootScope, NstSvcAuth, NST_AUTH_EVENT) {
    function InteractionTracker() {
      if (NstSvcAuth && NstSvcAuth.user) {
        Analytics.set('&uid', NstSvcAuth.user.id);
      }

      $rootScope.$on(NST_AUTH_EVENT.AUTHORIZE, function () {
        Analytics.set('&uid', NstSvcAuth.user.id);
      });

    }

    InteractionTracker.prototype.trackEvent = function (category, action, value) {
      // Analytics.set('dimension1', $state.current.name);
      Analytics.trackEvent(category, action, NST_CONFIG.APP_VERSION, value);
    };

    return new InteractionTracker();
  }
})();
