(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_STORE_ROUTE_PATTERN', {
      DOWNLOAD: '{{BASE_URL}}/download/{{SESSION_KEY}}/{{UNIVERSAL_ID}}/{{TOKEN}}',
      VIEW: '{{BASE_URL}}/view/{{SESSION_KEY}}/{{UNIVERSAL_ID}}/{{TOKEN}}',
      STREAM: '{{BASE_URL}}/stream/{{SESSION_KEY}}/{{UNIVERSAL_ID}}/{{TOKEN}}'
    });
})();
