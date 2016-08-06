(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_ATTACHMENTS_VIEW_MODE', {
      AUTO: 'auto',
      BADGE: 'badge',
      THUMBNAIL: 'thumbnail'
    });
})();
