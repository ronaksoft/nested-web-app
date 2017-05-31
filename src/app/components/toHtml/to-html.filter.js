(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.text')
    .filter('plainToHtml', function () {
      return function (content) {

        return ((content || "") + "")  // make sure it is a string;
        // .replace(/&/g, "&amp;")
        // .replace(/</g, "&lt;")
        // .replace(/>/g, "&gt;")
        .replace(/\t/g, "    ")
        .replace(/\r\n|\r|\n/g, "<br />");

      };
    });
})();
