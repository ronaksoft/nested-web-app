(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .constant('NST_ATTACHMENTS_PREVIEW_BAR_MODE', {
      AUTO: 'auto',
      BADGE: 'badge',
      THUMBNAIL: 'thumbnail',
      THUMBNAIL_ONLY_IMAGE: 'onlyimg',
      THUMBNAIL_TWO_IMAGE: 'twoimg'
    });
})();
