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
      this.order = 0;
      this.setQuery(query);
      NstObject.call(this);
    }

    SearchQuery.prototype = new NstObject();
    SearchQuery.prototype.constructor = SearchQuery;

    SearchQuery.prototype.setQuery = function (query, secondaryQuery) {
      this.places = [];
      this.users = [];
      this.labels = [];
      this.otherKeywords = [];
      this.order = 0;
      var secondaryResult = {
        places: [],
        users: [],
        labels: [],
        keywords: []
      };

      this.prefixes = {
        user: NST_SEARCH_QUERY_PREFIX.NEW_USER,
        place: NST_SEARCH_QUERY_PREFIX.NEW_PLACE,
        label: NST_SEARCH_QUERY_PREFIX.NEW_LABEL,
        subject: NST_SEARCH_QUERY_PREFIX.SUBJECT,
        attachment: NST_SEARCH_QUERY_PREFIX.ATTACHMENT,
        within: NST_SEARCH_QUERY_PREFIX.WITHIN,
        date: NST_SEARCH_QUERY_PREFIX.DATE
      };


      var result = this.parseQuery(query);

      if ((secondaryQuery !== null && secondaryQuery !== undefined) && secondaryQuery.length > 0) {
        secondaryResult = this.parseQuery(secondaryQuery);
      }

      var that = this;

      Array.prototype.concat(result.places, secondaryResult.places).forEach(function (item) {
        that.addPlace(item.id, item.order);
      });

      Array.prototype.concat(result.users, secondaryResult.users).forEach(function (item) {
        that.addUser(item.id, item.order);
      });

      Array.prototype.concat(result.labels, secondaryResult.labels).forEach(function (item) {
        that.addLabel(item.id, item.order);
      });

      this.subject = result.subject;
      this.hasAttachment = result.hasAttachment;
      this.within = result.within;
      this.date = result.date;

      console.log(result);

      if (secondaryQuery !== null && secondaryQuery !== undefined) {
        secondaryResult.keywords.forEach(function (item) {
          that.addOtherKeyword(item.id, item.order);
        });
      } else {
        result.keywords.forEach(function (item) {
          that.addOtherKeyword(item.id, item.order);
        });
      }
    };

    SearchQuery.prototype.parseQuery = function (query) {
      var places = [];
      var users = [];
      var labels = [];
      var keywords = [];
      var subject = '';
      var hasAttachment = false;
      var within = '1';
      var date = '';
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

      var that = this;

      _.forEach(words, function (word) {
        that.order++;
        if (_.startsWith(word, that.prefixes.place)) {
          places.push({
            id: _.replace(word, that.prefixes.place, ''),
            order: that.order
          });
        } else if (_.startsWith(word, that.prefixes.user)) {
          users.push({
            id: _.replace(word, that.prefixes.user, ''),
            order: that.order
          });
        } else if (_.startsWith(word, that.prefixes.label)) {
          labels.push({
            id: _.trim(_.replace(word, that.prefixes.label, ''), '"'),
            order: that.order
          });
        } else if (_.startsWith(word, that.prefixes.subject)) {
          subject = _.trim(_.replace(word, that.prefixes.subject, ''), '"');
        } else if (_.startsWith(word, that.prefixes.attachment)) {
          hasAttachment = (_.replace(word, that.prefixes.attachment, '') === 'true');
        } else if (_.startsWith(word, that.prefixes.within)) {
          within = _.trim(_.replace(word, that.prefixes.within, ''), '"');
        } else if (_.startsWith(word, that.prefixes.date)) {
          date = _.trim(_.replace(word, that.prefixes.date, ''), '"');
        }
        else {
          if (word.length > 0) {
            keywords.push({
              id: word,
              order: that.order
            });
          }
        }
      });

      return {
        places: places,
        users: users,
        labels: labels,
        keywords: keywords,
        subject: subject,
        hasAttachment: hasAttachment,
        within: within,
        date: date
      };
    };

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

    SearchQuery.prototype.toAdvancedString = function () {
      var query = this.toString();

      query += ' ';
      query += this.prefixes.subject + '"' + this.subject + '" ';
      query += this.prefixes.attachment + (this.hasAttachment? 'true': 'false') + ' ';
      query += this.prefixes.within + '"' + this.within + '" ';
      query += this.prefixes.date + '"' + this.date + '"';

      return query;
    };

    SearchQuery.prototype.ToEncodeString = function () {
      return encodeURIComponent(this.toString());
    };

    SearchQuery.prototype.addPlace = function (place, order) {
      if (!checkValidity(place)) {
        return;
      }
      if (order === null || order === undefined) {
        order = ++this.order;
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

    SearchQuery.prototype.setPlaces = function (places) {
      places = places.split(',');
      for (var i in places) {
        this.addPlace(places[i]);
      }
    };

    SearchQuery.prototype.getPlaces = function () {
      return _.map(this.places, function (item) {
        return item.id;
      }).join(',');
    };

    SearchQuery.prototype.addUser = function (user, order) {
      if (!checkValidity(user)) {
        return;
      }
      if (order === null || order === undefined) {
        order = ++this.order;
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

    SearchQuery.prototype.setUsers = function (users) {
      users = users.split(',');
      for (var i in users) {
        this.addUser(users[i]);
      }
    };

    SearchQuery.prototype.getUsers = function () {
      return _.map(this.users, function (item) {
        return item.id;
      }).join(',');
    };

    SearchQuery.prototype.addLabel = function (label, order) {
      if (!checkValidity(label)) {
        return;
      }
      if (order === null || order === undefined) {
        order = ++this.order;
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

    SearchQuery.prototype.setLabels = function (labels) {
      labels = labels.split(',');
      for (var i in labels) {
        this.addLabel(labels[i]);
      }
    };

    SearchQuery.prototype.getLabels = function () {
      return _.map(this.labels, function (item) {
        return item.id;
      }).join(',');
    };

    SearchQuery.prototype.addOtherKeyword = function (keyword, order) {
      if (!checkValidity(keyword)) {
        return;
      }
      if (order === null || order === undefined) {
        order = ++this.order;
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

    SearchQuery.prototype.removeAllKeywords = function () {
      this.otherKeywords = [];
    };

    SearchQuery.prototype.setAllKeywords = function (keywords) {
      this.removeAllKeywords();
      this.addOtherKeyword(keywords);
    };

    SearchQuery.prototype.getAllKeywords = function () {
      return this.otherKeywords.map(function (item) {
        return item.id;
      }).join(' ');
    };

    SearchQuery.prototype.setSubject = function (subject) {
      this.subject = subject;
    };

    SearchQuery.prototype.getSubject = function () {
      return this.subject;
    };

    SearchQuery.prototype.setHasAttachment = function (has) {
      this.hasAttachment = has;
    };

    SearchQuery.prototype.getHasAttachment = function () {
      return this.hasAttachment;
    };

    SearchQuery.prototype.setWithin = function (within) {
      this.within = within;
    };

    SearchQuery.prototype.getWithin = function () {
      return this.within;
    };

    SearchQuery.prototype.setDate = function (date) {
      this.date = date;
    };

    SearchQuery.prototype.getDate = function () {
      return this.date;
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

    SearchQuery.prototype.removeLastItem = function () {
      var items = this.getSortedParams();
      if (items.length > 0) {
        var item = items[items.length - 1];
        switch (item.type) {
          case 'place':
            this.removePlace(item.id);
            break;
          case 'user':
            this.removeUser(item.id);
            break;
          case 'label':
            this.removeLabel(item.id);
            break;
          case 'keyword':
            this.removeKeyword(item.id);
            break;
        }
      }
    };

    function checkValidity(text) {
      return (text !== undefined && text !== null && text.length !== 0);
    }

    return SearchQuery;


  }
})();
