(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .service('NstSvcSuggestionFactory', NstSvcSuggestionFactory);

  /** @ngInject */
  function NstSvcSuggestionFactory($q, _, NstBaseFactory, NstSvcServer, NstSuggestion,
                                   NstSvcPlaceFactory, NstSvcUserFactory, NstSvcLabelFactory) {
    function SuggestionFactory() {

    }

    SuggestionFactory.prototype = new NstBaseFactory();
    SuggestionFactory.prototype.constructor = SuggestionFactory;

    SuggestionFactory.prototype.searchSuggestion = searchSuggestion;

    var factory = new SuggestionFactory();
    return factory;

    function parse(data) {
      var suggestion = new NstSuggestion();

      suggestion.places = _.map(data.places, function(place) {
        NstSvcPlaceFactory.set(place);
        return NstSvcPlaceFactory.parseTinyPlace(place);
      });

      suggestion.accounts = _.map(data.accounts, function (member) {
        NstSvcUserFactory.set(member);
        return NstSvcUserFactory.parseTinyUser(member);
      });

      suggestion.labels = _.map(data.labels, function (item) {
        NstSvcLabelFactory.set(item);
        return NstSvcLabelFactory.parse(item);
      });

      suggestion.histories = data.history;

      return suggestion;
    }

    function searchSuggestion(keyword) {
      var params = {
        keyword: keyword
      };
      var defer = $q.defer();
      return factory.sentinel.watch(function () {
        NstSvcServer.request('search/suggestions', params).then(function (result) {
          defer.resolve(parse(result));
        }).catch(defer.reject);
        return defer.promise;
      }, 'searchSuggestion');
    }

  }
})
();
