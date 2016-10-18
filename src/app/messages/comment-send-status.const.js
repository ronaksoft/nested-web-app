(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .constant('NST_COMMENT_SEND_STATUS', {
      NONE : 'none',
      PROGRESS : 'progress',
      SUCCESS : 'success',
      FAIL : 'fail'
    });

})();
