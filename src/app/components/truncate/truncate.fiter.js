(function () {
  'use strict';

  angular
    .module('nested')
    .filter('truncate', function () {
      return function (content) {

        var maxCharacters = 250;

        if (content == null) return "";

        content = "" + content;

        content = content.trim();

        if (content.length <= maxCharacters) return content;
        if (content.length > maxCharacters)
          return content.substr(0,247) + '...'

        content = content.substring(0, maxCharacters);

        var lastSpace = content.lastIndexOf(" ")

        if (lastSpace > -1) content = content.substr(0, lastSpace);

        return content + '...';
      };
    });
})();
