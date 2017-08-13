(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .filter('scapeSpace', function () {
      return function (content) {

        if (content == null) return "";

        content = content.trim();

        return content.replace(/\s/g, ' ');
        // return content.replace(/\s/g, '-');
      };
    })
    .filter('scapeRevSpace', function () {
      return function (content) {

        var maxCharacters = 250;

        if (content == null) return "";

        return content.replace(/\s/g, ' ');
        // return content.replace(/-/g, ' ');
      };
    });
})();
