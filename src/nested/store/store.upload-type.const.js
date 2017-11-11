(function() {
  'use strict';

  angular
    .module('ronak.nested.web.file')
    .constant('NST_STORE_UPLOAD_TYPE', {
      GIF: 'gif',
      FILE: 'file',
      AUDIO: 'audio',
      IMAGE: 'image',
      VIDEO: 'video',
      PLACE_PIC: 'place_pic',
      PROFILE_PIC: 'profile_pic',
      VOICE: 'voice'
    });
})();
