(function () {
  'use strict';

  angular
    .module('ronak.nested.web', [
      'ronak.nested.web.main',
      'ronak.nested.web.common',
      'ronak.nested.web.authenticate',
      'ronak.nested.web.message',
      'ronak.nested.web.comment',
      'ronak.nested.web.notification',
      'ronak.nested.web.components',
      'ronak.nested.web.activity',
      'ronak.nested.web.user',
      'ronak.nested.web.settings',
      'ronak.nested.web.place',
      'ronak.nested.web.file',
      'ronak.nested.web.contact',
      'ronak.nested.web.models',
      'ronak.nested.web.data',
      'ronak.nested.web.config',
      'ronak.nested.web.3rd',
      'ng.deviceDetector',
      'ckeditor'
    ]);
})();
