(function () {
  'use strict';

  angular
    .module('nested')
    .filter('openLinkInNewWindow', function () {
      return function (toParse) {
        if (!toParse){
          return "";
        }
        var result = toParse.replace(/<a(.*?)>(.*?)<\/a>/g, function (input) {
          //TODO:: Handle change attr by pure JS
          var link = $(input);
          $(link).attr('target','_blank');
          return $(link)[0].outerHTML;
        });
        return result;
      };
    });
})();
