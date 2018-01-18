(function () {
  'use strict';

  angular
    .module('ronak.nested.web')
    .constant('NST_KEY', {
      GENERAL_SETTING_I18N: 'general.setting.i18n',
      GENERAL_SETTING_PLACE_ORDER: 'general.setting.place-order',
      GENERAL_NEW_SETTING_PLACE_ORDER: 'general.new.setting.place-order',
      WEBAPP_SETTING_RECENT_EMOJI: 'webapp.setting.recent-emoji',
      WEBAPP_SETTING_DOCUMENT_PREVIEW: 'webapp.setting.document-preview', // open document with 3th services (google)
      WEBAPP_SETTING_THEME_DARK_MOOD: 'webapp.setting.theme-dark-mood' // open document with 3th services (google)
    });
})();
