(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_FILE_TYPE', {
      IMAGE: 'image',
      ARCHIVE: 'archive',
      DOCUMENT: 'document',
      MULTIMEDIA: 'multimedia',
      PDF: 'pdf',
      OTHER: 'other'
    });
})();
