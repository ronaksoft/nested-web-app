(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .filter('nstPopover', function(_) {
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
          if (words[i].indexOf('@') > -1) {
            string += '<a class="nst-user-popover" user-detail="' + _.trimStart(words[i], '@') + '">' + words[i] + '</a>';
          } else {
            string += words[i];
          }
        }

        return string;
      };
    })
})();
