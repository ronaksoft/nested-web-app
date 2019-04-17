(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstSuggestion', NstSuggestion);

  function NstSuggestion() {
    Suggestion.prototype = {};
    Suggestion.prototype.constructor = Suggestion;

    function Suggestion() {
      this.accounts = undefined;
      this.labels = undefined;
      this.places = undefined;
      this.histories = undefined;
      this.tos = undefined;
    }

    return Suggestion;
  }
})();
