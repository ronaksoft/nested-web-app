(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NstSearchQuery', NstSearchQuery);

  /** @ngInject */
  function NstSearchQuery(NstObject, NST_SEARCH_QUERY_PREFIX) {
    var QUERY_SEPARATOR = ' ';
    /**
     * Creates an instance of NstSearchQuery
     *
     * @param {String}    query   the query
     *
     * @constructor
     */
    function SearchQuery(query) {

      this.places = [];
      this.users = [];
      this.otherKeywords = [];

      var decodedQuery = decodeURIComponent(query);
      var words = _.split(decodedQuery, QUERY_SEPARATOR);

      _.forEach(words, function (word) {
        if (_.startsWith(word, NST_SEARCH_QUERY_PREFIX.PLACE)) {

          this.places.push(_.trimStart(word, NST_SEARCH_QUERY_PREFIX.PLACE));
        } else if (_.startsWith(word, NST_SEARCH_QUERY_PREFIX.USER)) {

          this.users.push(_.trimStart(word, NST_SEARCH_QUERY_PREFIX.USER));
        } else {

          this.otherKeywords.push(word);
        }
      }.bind(this));

      NstObject.call(this);
    }

    SearchQuery.prototype = new NstObject();
    SearchQuery.prototype.constructor = SearchQuery;

    SearchQuery.prototype.toString = function () {
      var items = _.concat(
        _.map(this.places, function (place) {
          return NST_SEARCH_QUERY_PREFIX.PLACE + place;
        }),
        _.map(this.users, function (user) {
          return NST_SEARCH_QUERY_PREFIX.USER + user;
        }),
        this.otherKeywords);

      return _.join(items, QUERY_SEPARATOR);
    }

    SearchQuery.prototype.ToEncodeString = function () {
      return encodeURIComponent(this.toString());
    }

    SearchQuery.prototype.addPlace = function (place) {
      if (!_.includes(this.places, place)) {
        this.places.push(place);
      }
    };
    SearchQuery.prototype.addUser = function (user) {
      if (!_.includes(this.users, user)) {
        this.users.push(user);
      }
    };
    SearchQuery.prototype.addOtherKeyword = function (keyword) {
      this.otherKeywords.push(keyword);
    };

    SearchQuery.encode = function (queryString) {
      return encodeURIComponent(queryString);
    };

    return SearchQuery;


  }
})();
