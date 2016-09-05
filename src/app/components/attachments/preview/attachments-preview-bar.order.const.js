(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_ATTACHMENTS_PREVIEW_BAR_ORDER', {
      order : ['video', 'image', 'audio', 'document','pdf','archive','other']
    });
})();
