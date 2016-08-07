(function () {
  'use strict';

  angular
    .module('nested')
    .filter('openLinkInNewWindow', function () {
      return function (toParse) {
        return !toParse ? '' : toParse.replace(/<a(.*?)>(.*?)<\/a>/g, function (input) {
          //TODO:: Handle change attr by pure JS
          var link = $(input);
          $(link).attr('target','_blank');
          return $(link)[0].outerHTML;
        });
      };
    });
})();
