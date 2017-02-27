(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcInteractionTracker', NstSvcInteractionTracker);

  /** @ngInject */
  function NstSvcInteractionTracker(Analytics, NST_CONFIG) {
    function InteractionTracker() {

    }

    InteractionTracker.prototype.trackEvent = function (category, action, value) {
      Analytics.trackEvent(category, action, NST_CONFIG.APP_VERSION, value);
    };

    return new InteractionTracker();
  }
})();
