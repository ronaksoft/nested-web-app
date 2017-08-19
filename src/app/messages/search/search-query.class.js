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
     *
     * @constructor
     */
    function SearchQuery(query) {
      this.places = [];
      this.users = [];
      this.labels = [];
      this.otherKeywords = [];

      var decodedQuery = decodeURIComponent(query);

      var words = [];
      var queryRegEx = /(\S([^[:|\s]+):\"([^"]+)")|(\"([^"]+)")|(\S+)/g;

      var match;
      do {
        match = queryRegEx.exec(decodedQuery);
        if (match) {
          words.push(match[0]);
        }
      } while (match);

      this.prefixes = {};
      this.prefixes.user = NST_SEARCH_QUERY_PREFIX.NEW_USER;
      this.prefixes.place = NST_SEARCH_QUERY_PREFIX.NEW_PLACE;
      this.prefixes.label = NST_SEARCH_QUERY_PREFIX.NEW_LABEL;

      var that = this;

      var order = 0;

      _.forEach(words, function (word) {
        order++;
        if (_.startsWith(word, that.prefixes.place)) {
          this.addPlace(_.replace(word, that.prefixes.place, ''), order);
        } else if (_.startsWith(word, that.prefixes.user)) {
          this.addUser(_.replace(word, that.prefixes.user, ''), order);
        } else if (_.startsWith(word, that.prefixes.label)) {
          this.addLabel(_.trim(_.replace(word, that.prefixes.label, ''), '"'), order);
        } else {
          if (word.length > 0) {
            this.addOtherKeyword(word, order);
          }
        }
      }.bind(this));

      NstObject.call(this);
    }

    SearchQuery.prototype = new NstObject();
    SearchQuery.prototype.constructor = SearchQuery;

    SearchQuery.prototype.toString = function () {
      var items = this.getSortedParams();
      var stringList = [];

      for (var i = 0; i < items.length; i++) {
        if (items[i].type === 'place') {
          stringList.push(this.prefixes.place + items[i].id);
        } else if (items[i].type === 'user') {
          stringList.push(this.prefixes.user + items[i].id);
        } else if (items[i].type === 'label') {
          stringList.push(this.prefixes.label + '"' + items[i].id + '"');
        } else {
          stringList.push(items[i].id);
        }
      }

      return _.join(stringList, QUERY_SEPARATOR);
    };

    SearchQuery.prototype.ToEncodeString = function () {
      return encodeURIComponent(this.toString());
    };

    SearchQuery.prototype.addPlace = function (place, order) {
      if (order === null) {
        order = 0;
      }
      if (!_.find(this.places, {id: place})) {
        this.places.push({
          id: place,
          order: order
        });
      }
    };

    SearchQuery.prototype.removePlace = function (place) {
      _.remove(this.places, function (item) {
        return place === item.id;
      });
    };

    SearchQuery.prototype.getDefaultPlaceId = function () {
      if (this.places.length > 0){
        return this.places[0].id;
      } else {
        return null;
      }
    };

    SearchQuery.prototype.addUser = function (user, order) {
      if (order === null) {
        order = 0;
      }
      if (!_.find(this.users, {id: user})) {
        this.users.push({
          id: user,
          order: order
        });
      }
    };

    SearchQuery.prototype.removeUser = function (user) {
      _.remove(this.users, function (item) {
        return user === item.id;
      });
    };

    SearchQuery.prototype.addLabel = function (label, order) {
      if (order === null) {
        order = 0;
      }
      if (!_.find(this.labels, {id: label})) {
        this.labels.push({
          id: label,
          order: order
        });
      }
    };

    SearchQuery.prototype.removeLabel = function (label) {
      _.remove(this.labels, function (item) {
        return label === item.id;
      });
    };

    SearchQuery.prototype.addOtherKeyword = function (keyword, order) {
      if (order === null) {
        order = 0;
      }
      if (!_.find(this.otherKeywords, {id: keyword})) {
        this.otherKeywords.push({
          id: keyword,
          order: order
        });
      }
    };

    SearchQuery.prototype.removeKeyword = function (keyword) {
      _.remove(this.otherKeywords, function (item) {
        return keyword === item.id;
      });
    };

    SearchQuery.encode = function (queryString) {
      return encodeURIComponent(queryString);
    };

    SearchQuery.prototype.getSearchParams = function () {
      return {
        places: _.map(this.places, function (item) {
          return item.id;
        }),
        users: _.map(this.users, function (item) {
          return item.id;
        }),
        labels: _.map(this.labels, function (item) {
          return item.id;
        }),
        keywords: _.map(this.otherKeywords, function (item) {
          return item.id;
        })
      };
    };

    SearchQuery.prototype.getSortedParams = function () {
      var tempList = [];
      var i;
      for (i = 0; i < this.places.length; i++) {
        tempList.push({
          id: this.places[i].id,
          order: this.places[i].order,
          type: 'place'
        });
      }

      for (i = 0; i < this.users.length; i++) {
        tempList.push({
          id: this.users[i].id,
          order: this.users[i].order,
          type: 'user'
        });
      }

      for (i = 0; i < this.labels.length; i++) {
        tempList.push({
          id: this.labels[i].id,
          order: this.labels[i].order,
          type: 'label'
        });
      }

      for (i = 0; i < this.otherKeywords.length; i++) {
        tempList.push({
          id: this.otherKeywords[i].id,
          order: this.otherKeywords[i].order,
          type: 'keyword'
        });
      }

      tempList.sort(function (a, b) {
        return (a.order < b.order ? -1 : 1);
      });

      return tempList;
    };

    return SearchQuery;


  }
})();
