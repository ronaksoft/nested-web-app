(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .filter('removeHTMLTags', function(){
      return function(text) {
        return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
      };
    })
    .filter('truncate', function () {
      return function (content) {
          console.log("yes");
              
        var maxCharacters = 250;

        if (content == null) return "";

        content = content.trim();

        if (content.length <= maxCharacters) return content;

        return content.substr(0, 247) + '...';
          
      };
    });
})();
