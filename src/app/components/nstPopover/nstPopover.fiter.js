(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .filter('nstPopover', function(NstSvcUserFactory) {
      return function(text) {
        var regex = /@\S*|(\S+|\s)/g;

        var match;
        var words = [];
        do {
          match = regex.exec(text);
          if (match) {
            words.push(match[0]);
          }
        } while (match);

        var string = '';

        for (var i in words) {
          // if (words[i] == '@hamidrezakk') {
          //   NstSvcUserFactory.getTiny('hamidrezakk').then(function(result) {
          //     console.log(result);
          //   });
          // }
          if (words[i].indexOf('@') > -1) {
            string += '<a class="nst-user-popover" nst-user-popover="' + words[i] + '">' + words[i] + '</a>';
          } else {
            string += words[i];
          }
        }

        return string;
      };
    })
})();
