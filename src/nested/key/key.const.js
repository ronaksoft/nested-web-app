(function () {
  'use strict';

  angular
    .module('ronak.nested.web')
    .constant('NST_KEY', {
      GENERAL_SETTING_I18N: 'general.setting.i18n',
      GENERAL_SETTING_SIGNATURE: 'general.setting.signature',
      GENERAL_SETTING_PLACE_ORDER: 'general.setting.place-order',
      GENERAL_SETTING_COMMENT_ACTIVITY: 'general.setting.comment-activity',
      GENERAL_NEW_SETTING_PLACE_ORDER: 'general.new.setting.place-order',
      GENERAL_COMPACT_VIEW: 'general.compact-view',
      WEBAPP_SETTING_RECENT_EMOJI: 'webapp.setting.recent-emoji',
      WEBAPP_SETTING_DOCUMENT_PREVIEW: 'webapp.setting.document-preview', // open document with 3th services (google)
      WEBAPP_SETTING_THEME_NIGHT_MODE: 'webapp.setting.theme-night-mode'
    });
})();
