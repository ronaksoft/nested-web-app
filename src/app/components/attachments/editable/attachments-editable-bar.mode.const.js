(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_ATTACHMENTS_EDITABLE_BAR_MODE', {
      AUTO: 'auto',
      BADGE: 'badge',
      THUMBNAIL: 'thumbnail'
    });
})();
