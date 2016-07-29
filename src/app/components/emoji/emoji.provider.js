(function() {
  'use strict';

  angular
    .module('nested')
    .provider('emoji', function () {
      var self = this;

      var findToParse = function (toParse) {
        if (angular.isElement(toParse)) {
          return toParse[0];
        }

        return toParse;
      };

      self.setOptions = function (opts) {
        this.opts = opts;
      };

      self.$get = function ($window) {
        return function parse(toParse) {
          return $window.emojione.toImage(findToParse(toParse) || '');
        };
      };

      return self;
    });
})();
