(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_STORE_UPLOAD_TYPE', {
      FILE: 'upload/file',
      PLACE_PICTURE: 'upload/place_pic',
      PROFILE_PICTURE: 'upload/profile_pic'
    });
})();
