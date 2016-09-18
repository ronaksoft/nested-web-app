(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .constant('NST_ATTACHMENTS_PREVIEW_BAR_ORDER', {
      order : ['video', 'image', 'audio', 'document','pdf','archive','other']
    });
})();
