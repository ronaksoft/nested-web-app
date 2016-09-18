(function() {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .constant('NST_FILE_TYPE', {
      IMAGE: 'image',
      ARCHIVE: 'archive',
      DOCUMENT: 'document',
      AUDIO: 'audio',
      VIDEO: 'video',
      PDF: 'pdf',
      OTHER: 'other'
    });
})();
