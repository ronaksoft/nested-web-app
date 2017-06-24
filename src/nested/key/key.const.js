(function () {
  'use strict';

  angular
    .module('ronak.nested.web')
    .constant('NST_KEY', {
      GENERAL_SETTING_PLACE_ORDER: 'general.setting.place-order',
      WEBAPP_SETTING_RECENT_EMOJI: 'webapp.setting.recent-emoji',
      WEBAPP_SETTING_DOCUMENT_PREVIEW: 'webapp.setting.document-preview', // open document with 3th services (google)
    });
})();
