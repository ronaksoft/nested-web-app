(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .filter('removeHTMLTags', function () {
      return function (text) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
      };
    })
    .filter('truncate', function () {
      return function (content) {

        var maxCharacters = 250;

        if (content == null) return "";

        content = content.trim();

        if (content.length <= maxCharacters) return content;

        return content.substr(0, 247) + '...';

      };
    })
    .filter('normalizeText', function () {
      return function (content) {
        if (content == null) {
          return "";
        }

        var maxCharacters = 250;

        content = content.trim();

        content = String(content).replace(/<[^>]*>/g, " ");
        // content = String(content).replace("<br>/g", " ");

        if (content.length <= maxCharacters) return content;

        return content.substr(0, maxCharacters) + '...';

      };
    });
})();
