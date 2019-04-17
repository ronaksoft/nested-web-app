(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .factory('NstSearchQuery', NstSearchQuery);

  /** @ngInject */
  function NstSearchQuery(NstObject, NST_SEARCH_QUERY_PREFIX, NstSvcI18n, _) {
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

    var searchPrefixLocale = [];
    if (NstSvcI18n.selectedLocale === 'en-US') {
      searchPrefixLocale.user = NST_SEARCH_QUERY_PREFIX.NEW_USER;
      searchPrefixLocale.place = NST_SEARCH_QUERY_PREFIX.NEW_PLACE;
      searchPrefixLocale.label = NST_SEARCH_QUERY_PREFIX.NEW_LABEL;
      searchPrefixLocale.to = NST_SEARCH_QUERY_PREFIX.NEW_TO;
      searchPrefixLocale.app = NST_SEARCH_QUERY_PREFIX.APP;
    } else {
      searchPrefixLocale.user = NST_SEARCH_QUERY_PREFIX.NEW_USER_FA;
      searchPrefixLocale.place = NST_SEARCH_QUERY_PREFIX.NEW_PLACE_FA;
      searchPrefixLocale.label = NST_SEARCH_QUERY_PREFIX.NEW_LABEL_FA;
      searchPrefixLocale.to = NST_SEARCH_QUERY_PREFIX.NEW_TO_FA;
      searchPrefixLocale.app = NST_SEARCH_QUERY_PREFIX.APP_FA;
    }

    SearchQuery.prototype = new NstObject();
    SearchQuery.prototype.constructor = SearchQuery;

    SearchQuery.prototype.setQuery = function (query, secondaryQuery) {
      this.places = [];
      this.users = [];
      this.labels = [];
      this.tos = [];
      this.otherKeywords = [];
      this.before = null;
      this.after = null;
      this.app = null;

      var secondaryResult = {
        places: [],
        users: [],
        labels: [],
        keywords: [],
        tos: []
      };

      this.prefixes = {
        user: NST_SEARCH_QUERY_PREFIX.NEW_USER,
        place: NST_SEARCH_QUERY_PREFIX.NEW_PLACE,
        label: NST_SEARCH_QUERY_PREFIX.NEW_LABEL,
        to: NST_SEARCH_QUERY_PREFIX.NEW_TO,
        subject: NST_SEARCH_QUERY_PREFIX.SUBJECT,
        attachment: NST_SEARCH_QUERY_PREFIX.ATTACHMENT,
        within: NST_SEARCH_QUERY_PREFIX.WITHIN,
        date: NST_SEARCH_QUERY_PREFIX.DATE,
        app: NST_SEARCH_QUERY_PREFIX.APP
      };

      this.order = 0;

      if (NstSvcI18n.selectedLocale !== 'en-US') {
        query = this.transformLocale(query);
        if (secondaryQuery !== null && secondaryQuery !== undefined) {
          secondaryQuery = this.transformLocale(secondaryQuery);
        }
      }

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

      Array.prototype.concat(result.tos, secondaryResult.tos).forEach(function (item) {
        that.addTo(item.id, item.order);
      });

      this.subject = result.subject;
      this.hasAttachment = result.hasAttachment;
      this.within = result.within;
      this.date = result.date;
      this.app = result.app;

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

    SearchQuery.prototype.transformLocale = function (str) {
      str = str || '';
      var userRe = new RegExp(searchPrefixLocale.user, 'g');
      var placeRe = new RegExp(searchPrefixLocale.place, 'g');
      var labelRe = new RegExp(searchPrefixLocale.label, 'g');
      var toRe = new RegExp(searchPrefixLocale.to, 'g');

      str = str.replace(userRe, this.prefixes.user);
      str = str.replace(placeRe, this.prefixes.place);
      str = str.replace(labelRe, this.prefixes.label);
      str = str.replace(toRe, this.prefixes.to);

      return str;
    };

    SearchQuery.prototype.parseQuery = function (query) {
      var places = [];
      var users = [];
      var labels = [];
      var tos = [];
      var keywords = [];
      var subject = '';
      var hasAttachment = false;
      var within = '1';
      var date = '';
      var app = '';
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
        } else if (_.startsWith(word, that.prefixes.to)) {
          tos.push({
            id: _.replace(word, that.prefixes.to, ''),
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
        } else if (_.startsWith(word, that.prefixes.app)) {
          app = _.replace(word, that.prefixes.app, '');
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
        tos: tos,
        keywords: keywords,
        subject: subject,
        hasAttachment: hasAttachment,
        within: within,
        date: date,
        app: app
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
        } else if (items[i].type === 'to') {
          stringList.push(this.prefixes.to + items[i].id);
        } else if (items[i].type === 'app') {
          stringList.push(this.prefixes.app + items[i].id);
        } else {
          stringList.push(items[i].id);
        }
      }

      return _.join(stringList, QUERY_SEPARATOR);
    };

    SearchQuery.prototype.toAdvancedString = function () {
      var query = this.toString();
      query += ' ';
      if (this.subject.length > 0) {
        query += this.prefixes.subject + '"' + this.subject + '" ';
      }
      if (this.hasAttachment) {
        query += this.prefixes.attachment + 'true ';
      }
      if (this.within.length > 0 && this.within !== '-1' && this.date.length > 0) {
        query += this.prefixes.within + '"' + this.within + '" ';
        query += this.prefixes.date + '"' + this.date + '"';
      }
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
      places = places.replace(/, /g, ',');
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
      users = users.replace(/, /g, ',');
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
      labels = labels.replace(/, /g, ',');
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

    SearchQuery.prototype.addTo = function (user, order) {
      if (!checkValidity(user)) {
        return;
      }
      if (order === null || order === undefined) {
        order = ++this.order;
      }
      if (!_.find(this.tos, {id: user})) {
        this.tos.push({
          id: user,
          order: order
        });
      }
    };

    SearchQuery.prototype.removeTo = function (user) {
      _.remove(this.tos, function (item) {
        return user === item.id;
      });
    };

    SearchQuery.prototype.setTos = function (users) {
      users = users.replace(/, /g, ',');
      users = users.split(',');
      for (var i in users) {
        this.addTo(users[i]);
      }
    };

    SearchQuery.prototype.getTos = function () {
      return _.map(this.tos, function (item) {
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
      this.within = String(within);
    };

    SearchQuery.prototype.getWithin = function () {
      return this.within;
    };

    SearchQuery.prototype.setDate = function (date) {
      this.date = String(date);
    };

    SearchQuery.prototype.getDate = function () {
      return this.date;
    };

    SearchQuery.prototype.setApp = function (app) {
      this.app = app;
    };

    SearchQuery.prototype.removeApp = function () {
      this.app = null;
    };

    SearchQuery.prototype.getApp = function () {
      return this.date;
    };

    SearchQuery.prototype.reset = function () {
      this.places = [];
      this.users = [];
      this.labels = [];
      this.tos = [];
      this.otherKeywords = [];
      this.before = null;
      this.after = null;
      this.app = null;
    };

    SearchQuery.encode = function (queryString) {
      return encodeURIComponent(queryString);
    };

    SearchQuery.prototype.getSearchParams = function () {
      if (this.date.length > 0 && this.within.length > 0) {
        this.before = parseInt(this.date);
        this.after = parseInt(this.date) - (parseInt(this.within) * 36288000); // 7 * 24 * 60 * 60 * 60
      }
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
        tos: _.map(this.tos, function (item) {
          return item.id;
        }),
        keywords: _.map(this.otherKeywords, function (item) {
          return item.id;
        }),
        app: this.app,
        subject: this.subject,
        hasAttachment: this.hasAttachment,
        before: this.before * 1000,
        after: this.after * 1000
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

      for (i = 0; i < this.tos.length; i++) {
        tempList.push({
          id: this.tos[i].id,
          order: this.tos[i].order,
          type: 'to'
        });
      }

      if (this.app) {
        tempList.push({
          id: this.app,
          order: 0,
          type: 'app'
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
          case 'to':
            this.removeTo(item.id);
            break;
          case 'app':
            this.removeApp();
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
