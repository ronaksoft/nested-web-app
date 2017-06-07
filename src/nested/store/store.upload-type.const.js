(function() {
  'use strict';

  angular
    .module('ronak.nested.web.file')
    .constant('NST_STORE_UPLOAD_TYPE', {
      GIF: 'UPLOAD/GIF',
      FILE: 'UPLOAD/FILE',
      AUDIO: 'UPLOAD/AUDIO',
      IMAGE: 'UPLOAD/IMAGE',
      VIDEO: 'UPLOAD/VIDEO',
      PLACE_PIC: 'UPLOAD/PLACE_PIC',
      PROFILE_PIC: 'UPLOAD/PROFILE_PIC'
    });
})();
