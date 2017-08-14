(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .factory('NstSearchQuery', NstSearchQuery);

  /** @ngInject */
  function NstSearchQuery(NstObject, NST_SEARCH_QUERY_PREFIX, _) {
    var QUERY_SEPARATOR = ' ';
    /**
     * Creates an instance of NstSearchQuery
     *
     * @param {String}    query   the query
     * @param {Boolean}    isNewMethod   new search method
     *
     * @constructor
     */
    function SearchQuery(query, isNewMethod) {

      this.newMethod = false;
      if (isNewMethod === true) {
        this.newMethod = true;
      }

      this.places = [];
      this.users = [];
      this.labels = [];
      this.otherKeywords = [];

      var decodedQuery = decodeURIComponent(query);

      if (_.startsWith(decodedQuery, NST_SEARCH_QUERY_PREFIX.NEW_METHOD_KEY)) {
        this.newMethod = true;
        decodedQuery = _.trimStart(decodedQuery, NST_SEARCH_QUERY_PREFIX.NEW_METHOD_KEY);
      }
      // var words = _.split(decodedQuery, QUERY_SEPARATOR);
      var words = [];
      var queryRegEx = /(\S([^[:|\s]+):\"([^"]+)")|(\S+)/g;

      var match;
      do {
        match = queryRegEx.exec(decodedQuery);
        if (match) {
          words.push(match[0]);
        }
      } while (match);

      this.prefixes = {};
      if (!this.newMethod) {
        this.prefixes.user = NST_SEARCH_QUERY_PREFIX.USER;
        this.prefixes.place = NST_SEARCH_QUERY_PREFIX.PLACE;
        this.prefixes.label = NST_SEARCH_QUERY_PREFIX.NEW_LABEL;
      } else {
        this.prefixes.user = NST_SEARCH_QUERY_PREFIX.NEW_USER;
        this.prefixes.place = NST_SEARCH_QUERY_PREFIX.NEW_PLACE;
        this.prefixes.label = NST_SEARCH_QUERY_PREFIX.NEW_LABEL;
      }

      var that = this;

      _.forEach(words, function (word) {
        if (_.startsWith(word, that.prefixes.place)) {
          this.addPlace(_.trimStart(word, that.prefixes.place));
        } else if (_.startsWith(word, that.prefixes.user)) {
          this.addUser(_.trimStart(word, that.prefixes.user));
        } else if (_.startsWith(word, that.prefixes.label)) {
          this.addLabel(_.trim(_.trimStart(word, that.prefixes.label), '"'));
        } else {
          if (word.length > 0) {
            this.otherKeywords.push(word);
          }
        }
      }.bind(this));

      NstObject.call(this);
    }

    SearchQuery.prototype = new NstObject();
    SearchQuery.prototype.constructor = SearchQuery;

    SearchQuery.prototype.toString = function (scape) {
      if (scape == null) {
        scape = true;
      }
      var that = this;
      var items = _.concat(
        _.map(this.places, function (place) {
          return that.prefixes.place + place;
        }),
        _.map(this.users, function (user) {
          return that.prefixes.user + user;
        }),
        _.map(this.labels, function (label) {
          return that.prefixes.label + '"' + label + '"';
        }),
        this.otherKeywords);

      if (this.newMethod && scape) {
        return NST_SEARCH_QUERY_PREFIX.NEW_METHOD_KEY + ' ' + _.join(items, QUERY_SEPARATOR);
      } else {
        return _.join(items, QUERY_SEPARATOR);
      }
    }

    SearchQuery.prototype.ToEncodeString = function () {
      return encodeURIComponent(this.toString());
    }

    SearchQuery.prototype.addPlace = function (place) {
      if (!_.includes(this.places, place)) {
        this.places.push(place);
      }
    };

    SearchQuery.prototype.getDefaultPlaceId = function () {
      if (this.places.length > 0){
        return this.places[0];
      } else {
        return null;
      }
    };

    SearchQuery.prototype.addUser = function (user) {
      if (!_.includes(this.users, user)) {
        this.users.push(user);
      }
    };

    SearchQuery.prototype.addLabel = function (label) {
      if (!_.includes(this.labels, label)) {
        this.labels.push(label);
      }
    };

    SearchQuery.prototype.addOtherKeyword = function (keyword) {
      this.otherKeywords.push(keyword);
    };

    SearchQuery.encode = function (queryString) {
      return encodeURIComponent(queryString);
    };

    SearchQuery.prototype.isNewMethod = function () {
      return this.newMethod;
    };

    SearchQuery.prototype.getSearchParams = function () {
      return {
        places: this.places,
        users: this.users,
        labels: this.labels,
        keywords: this.otherKeywords
      };
    };

    return SearchQuery;


  }
})();
