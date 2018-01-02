(function () {
    'use strict';

    angular
      .module('ronak.nested.web.components.sidebar')
      .controller('TopBarController', TopBarController);

    /** @ngInject */
    function TopBarController($q, $, $scope, $timeout, $state, $stateParams, $uibModal,
                              $rootScope, NST_SEARCH_QUERY_PREFIX, _, NstSvcTranslation,
                              NstSvcSuggestionFactory, NstSvcLabelFactory, NstSvcI18n,
                              NstSvcUserFactory, NstSvcNotificationFactory, NST_USER_SEARCH_AREA,
                              NstSvcPlaceFactory, NstSearchQuery, NST_CONFIG, NST_USER_EVENT, NST_NOTIFICATION_EVENT) {
      var searchPrefixLocale = [];
      if (NstSvcI18n.selectedLocale === 'en-US') {
        searchPrefixLocale.user = NST_SEARCH_QUERY_PREFIX.NEW_USER;
        searchPrefixLocale.place = NST_SEARCH_QUERY_PREFIX.NEW_PLACE;
        searchPrefixLocale.label = NST_SEARCH_QUERY_PREFIX.NEW_LABEL;
        searchPrefixLocale.to = NST_SEARCH_QUERY_PREFIX.NEW_TO;
      } else {
        searchPrefixLocale.user = NST_SEARCH_QUERY_PREFIX.NEW_USER_FA;
        searchPrefixLocale.place = NST_SEARCH_QUERY_PREFIX.NEW_PLACE_FA;
        searchPrefixLocale.label = NST_SEARCH_QUERY_PREFIX.NEW_LABEL_FA;
        searchPrefixLocale.to = NST_SEARCH_QUERY_PREFIX.NEW_TO_FA;
      }
      var vm = this;
      var eventReferences = [];
      vm.isPostLayout = false;
      vm.isTaskLayout = false;
      vm.APP_VERSION = NST_CONFIG.APP_VERSION;
      vm.BUILD_VERSION = NST_CONFIG.BUILD_VERSION;
      vm.searchPlaceholder = NstSvcTranslation.get('Search...');
      vm.searchKeyPressed = searchKeyPressed;
      vm.loadNotificationsCount = loadNotificationsCount;
      vm.closeProfile = closeProfile;
      vm.toggleSearchModal = toggleSearchModal;
      vm.toggleAdvancedSearch = toggleAdvancedSearch;
      vm.empty = empty;
      vm.isEmpty = isEmpty;
      vm.isTask = isTask;
      vm.query = '';
      vm.newQuery = '';
      vm.excludedQuery = '';
      vm.queryType = '';
      vm.notificationsCount = 0;
      vm.profileOpen = false;
      vm.notifOpen = false;
      vm.searchModalOpen = false;
      vm.advancedSearchOpen = false;
      vm.debouncedSugesstion = _.debounce(getSuggestions, 128);
      vm.searchIt = searchIt;
      vm.defaultSearch = true;
      vm.defaultSuggestion = {
        histories: [],
        places: [],
        accounts: [],
        labels: [],
        tos: []
      };
      vm.suggestion = {
        histories: [],
        places: [],
        accounts: [],
        labels: [],
        tos: []
      };
      vm.limits = {
        exact: {
          places: 6,
          accounts: 6,
          labels: 6,
          tos: 6
        },
        all: {
          places: 3,
          accounts: 3,
          labels: 3,
          tos: 3
        }
      };
      vm.advancedSearch = {
        keywords: '',
        users: '',
        places: '',
        subject: '',
        labels: '',
        tos: '',
        hasAttachment: false,
        within: '1',
        date: 0,
        dateText: null
      };
      vm.getLimit = getLimit;
      vm.resultCount = 0;
      vm.requestedLabels = 0;
      vm.selectedItem = -1;
      vm.addChip = addChip;
      vm.removeChip = removeChip;
      vm.chips = [];
      vm.isSearch = isSearch;
      vm.advancedSearchIt = advancedSearchIt;
      vm.datePickerconfig = {
        allowFuture: false
      };
      vm.companyConstant = null;

      vm.translation = {
        submit: NstSvcTranslation.get('Submit')
      };

      var searchQuery;

      function checkLayouts() {
        vm.isPostLayout = $state.current.options && $state.current.options.group !== 'settings' && $state.current.options.group !== 'task';
        vm.isTaskLayout = $state.current.options && $state.current.options.group === 'task';
      }

      (function () {
        vm.adminArea = '/admin';

        checkLayouts();
        initQuery(true);
        eventReferences.push($rootScope.$on('$stateChangeSuccess', function () {
          initQuery(false);
          isSearch();
          checkLayouts();
        }));
        NstSvcUserFactory.getCurrent(true).then(function(user) {
          vm.user = user;
          if (user.authority.labelEditor) {
            requestLabelCounter();
          }
        });
        // NstSvcSuggestionFactory.search('').then(function (result) {
        //   vm.defaultSuggestion = getUniqueItems(result);
        //   vm.suggestion = Object.assign({}, vm.defaultSuggestion);
        // });
        loadCompanyConstants();
        eventReferences.push($rootScope.$on('company-constants-loaded', function () {
          loadCompanyConstants();
        }));
      })();

      function loadCompanyConstants() {
        var data = window.companyConstants;
        if (data) {
          vm.companyConstant = _.cloneDeep(window.companyConstants);
          vm.companyConstant.logo = NST_CONFIG.STORE.URL + '/pic/' + vm.companyConstant.logo
        }
      }

      function isTask() {
        return ($state.current.options && $state.current.options.group === 'task');
      }

      function initQuery(init) {
        if (init) {
          if (vm.isSearch()) {
            vm.query = $stateParams.search;
            if (vm.query === '_') {
              vm.query = '';
            }
          }
          searchQuery = new NstSearchQuery(vm.query);
          NstSvcSuggestionFactory.search('').then(function (result) {
            vm.defaultSuggestion = getUniqueItems(result);
            vm.suggestion = Object.assign({}, vm.defaultSuggestion);
          });
        }
        if (vm.isSearch()) {
          vm.query = $stateParams.search;
          if (vm.query === '_') {
            vm.query = '';
          }
          vm.newQuery = '';
          if (!init) {
            searchQuery.setQuery(vm.query);
          }
          initChips(searchQuery.getSortedParams());
          getAdvancedSearchParams();
          vm.newQuery = searchQuery.getAllKeywords();
          if (_.trim(vm.newQuery).length === 0) {
            vm.suggestion = Object.assign({}, vm.defaultSuggestion);
          }
        } else {
          vm.toggleSearchModal(false);
          vm.empty();
        }
        vm.selectedItem = -1;
        $timeout(function (){
          scrollEndSearch();
        },100);
      }

      function requestLabelCounter() {
        NstSvcLabelFactory.getRequests().then(function (result) {
          vm.requestedLabels = result.length;
        });
      }

      function getAdvancedSearchParams() {
        vm.advancedSearch.keywords = searchQuery.getAllKeywords();
        vm.advancedSearch.users = searchQuery.getUsers();
        vm.advancedSearch.places = searchQuery.getPlaces();
        vm.advancedSearch.subject = searchQuery.getSubject();
        vm.advancedSearch.labels = searchQuery.getLabels();
        vm.advancedSearch.tos = searchQuery.getTos();
        vm.advancedSearch.hasAttachment = searchQuery.getHasAttachment();
        vm.advancedSearch.within = searchQuery.getWithin();
        if (vm.advancedSearch.users.length > 0) {
          vm.advancedSearch.users = vm.advancedSearch.users + ', ';
        }
        if (vm.advancedSearch.places.length > 0) {
          vm.advancedSearch.places = vm.advancedSearch.places + ', ';
        }
        if (vm.advancedSearch.labels.length > 0) {
          vm.advancedSearch.labels = vm.advancedSearch.labels + ', ';
        }
        try {
          if (searchQuery.getDate() !== '') {
            vm.advancedSearch.date = searchQuery.getDate()/1000;
          }
        } catch (e) {
          vm.advancedSearch.date = '';
        }
      }

      function empty() {
        vm.query = '';
        vm.newQuery = '';
        vm.chips = [];
        vm.advancedSearch = {
          keywords: '',
          users: '',
          places: '',
          subject: '',
          labels: '',
          tos: '',
          hasAttachment: false,
          within: '1',
          date: ''
        };
        vm.selectedItem = -1;
        searchQuery.setQuery('');
        getSuggestions(vm.newQuery);
      }

      function isEmpty() {
        return (vm.query === '' && vm.newQuery === '' && vm.chips.length === 0);
      }

      function isSearch() {
        return $state.current.name === 'app.search' || $state.current.name === 'app.task.search';
      }

      function toggleSearchModal(force) {
        if (force === true) {
          $('html').addClass('_oh');
          vm.searchModalOpen = true ;
          vm.advancedSearchOpen = false;
          return;
        } else if (force === false) {
          $('html').removeClass('_oh');
          vm.searchModalOpen = false ;
          vm.advancedSearchOpen = false;
          return;
        }
        $('html').toggleClass('_oh');
        vm.searchModalOpen =! vm.searchModalOpen ;
        vm.advancedSearchOpen = false;
      }

      function toggleAdvancedSearch(force) {
        if (force) {
          vm.advancedSearchOpen = true ;
          return;
        }
        vm.searchModalOpen = false ;
        vm.advancedSearchOpen =! vm.advancedSearchOpen;
        if (!vm.advancedSearchOpen) {
          vm.searchModalOpen = true ;
        }
      }

      /**
       * @function goLabelRoute
       * Opens the label manager modal
       * @param {any} $event
       */
      vm.goLabelRoute = function ($event) {
        $event.preventDefault();
        $uibModal.open({
          animation: false,
          size: 'full-height-center',
          templateUrl: 'app/label/manage-label.html',
          controller: 'manageLabelController',
          controllerAs: 'ctrl'
        })
      };

      /**
       * Triggers when in search input any key being pressed
       * @param {event} $event
       * @param {string} text
       */
      function searchKeyPressed($event, text) {
        if (!isNotQuery($event)) {
          vm.toggleSearchModal(true);
          if (_.trim(text).length === 0) {
            getSuggestions(text);
          } else {
            vm.debouncedSugesstion(text);
          }
        } else {
          if (_.trim(text).length === 0) {
            getSuggestions(text);
          }
        }
        lastQuery = text;
      }

      var lastQuery = null;

      function isNotQuery(event) {
        var keys = [8, 13, 27, 38, 40];
        if (keys.indexOf(event.keyCode) > -1) {
          switch (event.keyCode) {
            case 8:
              backspaceHandler();
              return false;
            case 27:
              vm.toggleSearchModal();
              return true;
            case 13:
              returnKeyPressed();
              return true;
            case 38:
              vm.selectedItem--;
              if (vm.selectedItem < -1) {
                vm.selectedItem = -1;
              }
              break;
            case 40:
              vm.selectedItem++;
              if (vm.selectedItem >= vm.resultCount) {
                vm.selectedItem = vm.resultCount - 1;
              }
              break;
          }
          if (vm.selectedItem !== -1 && vm.resultCount > 0) {
            selectItem(vm.selectedItem).data._selected = true;
          } else {
            resetSelected(vm.suggestion.accounts);
            resetSelected(vm.suggestion.places);
            resetSelected(vm.suggestion.labels);
            resetSelected(vm.suggestion.tos);
          }
          return true;
        } else {
          return false;
        }
      }

      function returnKeyPressed() {
        if (vm.selectedItem === -1) {
          searchQuery.setQuery(vm.query, vm.newQuery);
        } else {
          var item = selectItem(vm.selectedItem);
          searchQuery.setQuery(vm.query, trimByType(vm.newQuery));
          switch (item.type) {
            case 'account':
              searchQuery.addUser(item.data.id);
              break;
            case 'place':
              searchQuery.addPlace(item.data.id);
              break;
            case 'label':
              searchQuery.addLabel(item.data.title);
              break;
            case 'to':
              searchQuery.addTo(item.data.id);
              break;
          }
        }
        if (isTask()) {
          $state.go('app.task.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
        } else {
          $state.go('app.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
        }
        vm.toggleSearchModal(false);
        vm.selectedItem = -1
      }

      function backspaceHandler() {
        if (lastQuery === '') {
          searchQuery.setQuery(vm.query, '');
          searchQuery.removeLastItem();
          if (isTask()) {
            $state.go('app.task.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
          } else {
            $state.go('app.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
          }
          vm.toggleSearchModal(false);
        }
      }

      function trimByType(text) {
        var words = text.split(' ');
        var index;
        var typeMap = {
          user: searchPrefixLocale.user,
          place: searchPrefixLocale.place,
          label: searchPrefixLocale.label,
          to: searchPrefixLocale.to
        };
        if (vm.queryType === 'other') {
          index = words.lastIndexOf(vm.excludedQuery);
        } else {
          index = words.lastIndexOf(typeMap[vm.queryType] + vm.excludedQuery);
        }
        if (index > -1) {
          words[index] = '';
          return words.join(' ');
        } else {
          return text;
        }
      }

      function countItems() {
        var count = 0;
        if (vm.suggestion.accounts.length > getLimit('accounts')) {
          count += getLimit('accounts');
        } else {
          count += vm.suggestion.accounts.length;
        }
        if (vm.suggestion.places.length > getLimit('places')) {
          count += getLimit('places');
        } else {
          count += vm.suggestion.places.length;
        }
        if (vm.suggestion.labels.length > getLimit('labels')) {
          count += getLimit('labels');
        } else {
          count += vm.suggestion.labels.length;
        }
        if (vm.suggestion.tos.length > getLimit('tos')) {
          count += getLimit('tos');
        } else {
          count += vm.suggestion.tos.length;
        }
        return count;
      }

      function resetSelected(items) {
        for (var i in items) {
          items[i]._selected = false;
        }
      }

      function selectItem(index) {
        var accountCount = 0;
        if (vm.suggestion.accounts.length > getLimit('accounts')) {
          accountCount = getLimit('accounts');
        } else {
          accountCount = vm.suggestion.accounts.length;
        }
        var placeCount = 0;
        if (vm.suggestion.places.length > getLimit('places')) {
          placeCount = getLimit('places');
        } else {
          placeCount = vm.suggestion.places.length;
        }
        var labelCount = 0;
        if (vm.suggestion.labels.length > getLimit('labels')) {
          labelCount = getLimit('labels');
        } else {
          labelCount = vm.suggestion.labels.length;
        }
        var toCount = 0;
        if (vm.suggestion.tos.length > getLimit('tos')) {
          toCount = getLimit('tos');
        } else {
          toCount = vm.suggestion.tos.length;
        }

        resetSelected(vm.suggestion.accounts);
        resetSelected(vm.suggestion.places);
        resetSelected(vm.suggestion.labels);
        resetSelected(vm.suggestion.tos);

        if (index >= 0 && index < accountCount) {
          return {
            data: vm.suggestion.accounts[index],
            type: 'account'
          }
        } else if (index >= accountCount && index < accountCount + placeCount) {
          return {
            data: vm.suggestion.places[index - accountCount],
            type: 'place'
          }
        } else if (index >= accountCount && index < accountCount + placeCount + toCount) {
          return {
            data: vm.suggestion.tos[index - (accountCount + placeCount)],
            type: 'to'
          }
        } else if (index >= accountCount + placeCount + toCount && index < accountCount + placeCount + toCount + labelCount) {
          return {
            data: vm.suggestion.labels[index - (accountCount + placeCount + toCount)],
            type: 'label'
          }
        }
      }

      function getUniqueItems(data) {
        var result = {
          places: [],
          accounts: [],
          labels: [],
          tos: [],
          history: []
        };
        var params = searchQuery.getSearchParams();
        if (!isTask()) {
          var places = _.map(params.places, function (item) {
            return {
              id: item
            };
          });
          if (data.places !== undefined) {
            result.places = _.differenceBy(_.uniqBy(data.places, 'id'), places, 'id');
          }
        }
        var users = _.map(params.users, function (item) {
          return {
            id: item
          };
        });
        if (data.accounts !== undefined) {
          result.accounts = _.differenceBy(_.uniqBy(data.accounts, 'id'), users, 'id');
        }
        if (isTask()) {
          var tos = _.map(params.tos, function (item) {
            return {
              id: item
            };
          });
          if (data.tos !== undefined) {
            result.tos = _.differenceBy(_.uniqBy(data.tos, 'id'), tos, 'id');
          }
        }
        var labels = _.map(params.labels, function (item) {
          return {
            title: item
          };
        });
        if (data.labels !== undefined) {
          result.labels = _.differenceBy(_.uniqBy(data.labels, 'id'), labels, 'title');
        }
        if (data.histories !== undefined) {
          result.histories = data.histories;
        }
        return result;
      }

      function getLastItem(query) {
        var queryRegEx = /(\S([^[:|\s]+):\"([^"]+)")|(\"([^"]+)")|(\S+)/g;

        var placePrefix = searchPrefixLocale.place;
        var userPrefix = searchPrefixLocale.user;
        var labelPrefix = searchPrefixLocale.label;
        var toPrefix = searchPrefixLocale.to;

        var word = query;
        var type = 'other';
        var match;
        do {
          match = queryRegEx.exec(query);
          if (match) {
            if (_.startsWith(match[0], placePrefix)) {
              word = _.replace(match[0], placePrefix, '');
              type = 'place';
            } else if (_.startsWith(match[0], userPrefix)) {
              word = _.replace(match[0], userPrefix, '');
              type = 'user';
            } else if (_.startsWith(match[0], labelPrefix)) {
              word = _.replace(match[0], labelPrefix, '');
              type = 'label';
            } else if (_.startsWith(match[0], toPrefix)) {
              word = _.replace(match[0], toPrefix, '');
              type = 'to';
            }
          }
        } while (match);

        return {
          word: word,
          type: type
        };
      }

      function getSuggestions(query, all) {
        if (_.trim(query).length === 0) {
          vm.defaultSearch = true;
          vm.suggestion = Object.assign({}, vm.defaultSuggestion);
        }
        else {
          vm.defaultSearch = false;
          var result = getLastItem(query);
          if (result.word === undefined || result.word === null) {
            result.word = '';
          }

          vm.excludedQuery = result.word;
          vm.queryType = result.type;
          var settings;
          switch (result.type) {
            case 'place':
              NstSvcPlaceFactory.searchForCompose(result.word).then(function (result) {
                vm.suggestion = getUniqueItems({places: result.places});
                vm.resultCount = countItems();
                vm.selectedItem = -1;
              });
              break;
            case 'user':
              settings = {
                query: result.word,
                limit: 6
              };
              NstSvcUserFactory.search(settings, NST_USER_SEARCH_AREA.ACCOUNTS).then(function (result) {
                vm.suggestion = getUniqueItems({accounts: result});
                vm.resultCount = countItems();
                vm.selectedItem = -1;
              });
              break;
            case 'to':
              settings = {
                query: result.word,
                limit: 6
              };
              NstSvcUserFactory.search(settings, NST_USER_SEARCH_AREA.ACCOUNTS).then(function (result) {
                vm.suggestion = getUniqueItems({tos: result});
                vm.resultCount = countItems();
                vm.selectedItem = -1;
              });
              break;
            case 'label':
              NstSvcLabelFactory.search(result.word).then(function (result) {
                vm.suggestion = getUniqueItems({labels: result});
                vm.resultCount = countItems();
                vm.selectedItem = -1;
              });
              break;
            case 'other':
              NstSvcSuggestionFactory.search(result.word).then(function (result) {
                vm.suggestion = getUniqueItems(result);
                vm.resultCount = countItems();
                vm.selectedItem = -1;
              });
              break;
          }
        }
      }

      function getLimit(type) {
        var category = (vm.queryType === 'other' || vm.defaultSearch) ? 'all': 'exact';
        return vm.limits[category][type] || 3;
      }

      function initChips(params) {
        vm.chips = [];
        var types = {
          'place': searchPrefixLocale.place,
          'user': searchPrefixLocale.user,
          'label': searchPrefixLocale.label,
          'to': searchPrefixLocale.to,
          'keyword': NST_SEARCH_QUERY_PREFIX.KEYWORD
        };
        params = _.filter(params, function (item) {
          return (item.type !== 'keyword');
        });
        vm.chips = _.map(params, function (item) {
          return {
            type: types[item.type],
            title: item.id
          };
        });
      }

      function addChip(id, type) {
        searchQuery.setQuery(vm.query, trimByType(vm.newQuery));
        switch (type) {
          case 'account':
            searchQuery.addUser(id);
            break;
          case 'place':
            searchQuery.addPlace(id);
            break;
          case 'label':
            searchQuery.addLabel(id);
            break;
          case 'to':
            searchQuery.addTo(id);
            break;
        }
        if (isTask()) {
          $state.go('app.task.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
        } else {
          $state.go('app.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
        }
        vm.toggleSearchModal(false);
        vm.queryType = 'other';
      }

      /**
       * remove selected chip by name from search query
       * @param {string} type
       * @param {string} name
       */
      function removeChip(type, name) {
        switch (type) {
          case searchPrefixLocale.place:
            searchQuery.removePlace(name);
            break;
          case searchPrefixLocale.user:
            searchQuery.removeUser(name);
            break;
          case searchPrefixLocale.label:
            searchQuery.removeLabel(name);
            break;
          case searchPrefixLocale.to:
            searchQuery.removeTo(name);
            break;
          case NST_SEARCH_QUERY_PREFIX.KEYWORD:
            searchQuery.removeKeyword(name);
            break;
        }
        if (isTask()) {
          $state.go('app.task.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
        } else {
          $state.go('app.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
        }
        if (vm.searchModalOpen) {
          vm.toggleSearchModal(false);
        }
      }

      function searchIt(query, withPrev) {
        if (withPrev === true) {
          searchQuery.setQuery(vm.query, query);
        } else {
          searchQuery.setQuery(query);
        }
        if (isTask()) {
          $state.go('app.task.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
        } else {
          $state.go('app.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
        }
        vm.toggleSearchModal(false);
      }

      function advancedSearchIt() {
        searchQuery.setAllKeywords(this.advancedSearch.keywords);
        searchQuery.setUsers(this.advancedSearch.users);
        searchQuery.setPlaces(this.advancedSearch.places);
        searchQuery.setSubject(this.advancedSearch.subject);
        searchQuery.setLabels(this.advancedSearch.labels);
        searchQuery.setTos(this.advancedSearch.tos);
        searchQuery.setHasAttachment(this.advancedSearch.hasAttachment);

        try {
          searchQuery.setWithin(this.advancedSearch.within);
          searchQuery.setDate(this.advancedSearch.date*1000);
        } catch (e) {
          searchQuery.setWithin('-1');
        }
        if (isTask()) {
          $state.go('app.task.search', {search: NstSearchQuery.encode(searchQuery.toAdvancedString()), advanced: 'true'});
        } else {
          $state.go('app.search', {search: NstSearchQuery.encode(searchQuery.toAdvancedString()), advanced: 'true'});
        }
        vm.toggleSearchModal(false);
      }

      /**
       * Listen to closing notification popover event
       */
      $scope.$on('close-mention', function () {
        vm.notifOpen = false;
      });

      function scrollEndSearch() {
        if (_.isFunction($scope.scrollEndSearch)) {
          $scope.scrollEndSearch();
        }
      }

      /**
       * @function getInvitations
       * Gets invitations
       * @returns {Promise}
       */
      function loadNotificationsCount() {
        NstSvcNotificationFactory.getNotificationsCount().then(function (count) {
          vm.notificationsCount = count;
        });
      }

      function closeProfile() {
        vm.profileOpen = false;
      }

      /**
       * Event listener for `reload-counters`
       */
      eventReferences.push($rootScope.$on('reload-counters', function () {
        loadNotificationsCount();
      }));

      eventReferences.push($rootScope.$on('topbar-notification-changed', function () {
        loadNotificationsCount();
      }));

      eventReferences.push($rootScope.$on(NST_NOTIFICATION_EVENT.UPDATE, function (e, data) {
        vm.notificationsCount = data.count;
      }));

      eventReferences.push($rootScope.$on(NST_USER_EVENT.PROFILE_UPDATED, function () {
        NstSvcUserFactory.getCurrent(true).then(function(user) {
          vm.user = user;
          NstSvcPlaceFactory.removeCache(user.id);
        });
      }));

      eventReferences.push($rootScope.$on(NST_USER_EVENT.PICTURE_UPDATED, function () {
        NstSvcUserFactory.getCurrent(true).then(function(user) {
          vm.user = user;
          NstSvcPlaceFactory.removeCache(user.id);
        });
      }));

      eventReferences.push($rootScope.$on(NST_USER_EVENT.PICTURE_REMOVED, function () {
        NstSvcUserFactory.getCurrent(true).then(function(user) {
          vm.user = user;
          NstSvcPlaceFactory.removeCache(user.id);
        });
      }));

      eventReferences.push($rootScope.$on('label-request-status-changed', function () {
        requestLabelCounter();
      }));

      $scope.$on('$destroy', function () {
        _.forEach(eventReferences, function (canceler) {
          if (_.isFunction(canceler)) {
            canceler();
          }
        });
      });
    }
  })();
