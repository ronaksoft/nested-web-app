(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_ATTACHMENTS_PREVIEW_BAR_MODE', {
      AUTO: 'auto',
      BADGE: 'badge',
      THUMBNAIL: 'thumbnail'
    });
})();
