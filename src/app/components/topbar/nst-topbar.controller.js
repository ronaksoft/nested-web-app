(function () {
    'use strict';

    angular
      .module('ronak.nested.web.components.sidebar')
      .controller('TopBarController', TopBarController);

    /** @ngInject */
    function TopBarController($q, $, $scope, $timeout, $state, $stateParams, $uibModal,
                              $rootScope, NST_SEARCH_QUERY_PREFIX, _, NstSvcTranslation,
                              NstSvcSuggestionFactory, NstSvcLabelFactory,
                              NstSvcUserFactory, NstSvcNotificationFactory, NST_USER_SEARCH_AREA,
                              NstSvcPlaceFactory, NstSearchQuery, NST_CONFIG, NST_USER_EVENT) {
      var vm = this;
      var eventReferences = [];
      vm.searchPlaceholder = NstSvcTranslation.get('Search...');
      vm.searchKeyPressed = searchKeyPressed;
      vm.loadNotificationsCount = loadNotificationsCount;
      vm.closeProfile = closeProfile;
      vm.toggleSearchModal = toggleSearchModal;
      vm.toggleAdvancedSearch = toggleAdvancedSearch;
      vm.empty = empty;
      vm.isEmpty = isEmpty;
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
        labels: []
      };
      vm.suggestion = {
        histories: [],
        places: [],
        accounts: [],
        labels: []
      };
      vm.limits = {
        exact: {
          places: 6,
          accounts: 6,
          labels: 6
        },
        all: {
          places: 3,
          accounts: 3,
          labels: 3
        }
      };
      vm.advancedSearch = {
        keywords: '',
        users: '',
        places: '',
        subject: '',
        labels: '',
        hasAttachment: false,
        within: '1',
        date: ''
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

      vm.translation = {
        submit: NstSvcTranslation.get('Submit')
      };

      var searchQuery;

      (function () {
        vm.adminArea = '';
        if (NST_CONFIG.ADMIN_URL.length > 0) {
          vm.adminArea = NST_CONFIG.ADMIN_URL;
        } else {
          vm.adminArea = location.protocol + '//' + NST_CONFIG.ADMIN_DOMAIN + (NST_CONFIG.ADMIN_PORT ? ':' + NST_CONFIG.ADMIN_PORT : '');
        }

        initQuery(true);
        $rootScope.$on('$stateChangeSuccess', function () {
          initQuery(false);
          isSearch();
        });
        NstSvcUserFactory.getCurrent().then(function(user) {
          vm.user = user;
          if (user.authority.labelEditor) {
            requsetLabelCounter();
          }
        });
        // NstSvcSuggestionFactory.search('').then(function (result) {
        //   vm.defaultSuggestion = getUniqueItems(result);
        //   vm.suggestion = Object.assign({}, vm.defaultSuggestion);
        // });
      })();

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
            NstSvcSuggestionFactory.search('').then(function (result) {
              vm.defaultSuggestion = getUniqueItems(result);
              vm.suggestion = Object.assign({}, vm.defaultSuggestion);
            });
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

      function requsetLabelCounter() {
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
            vm.advancedSearch.date = new Date(parseInt(searchQuery.getDate()) * 1000).toString();
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
          hasAttachment: false,
          within: '1',
          date: ''
        };
        vm.selectedItem = -1;
        searchQuery.setQuery('');
      }

      function isEmpty() {
        return (vm.query === '' && vm.newQuery === '' && vm.chips.length === 0);
      }

      function isSearch() {
        return $state.current.name === 'app.search';
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
          }
        }
        $state.go('app.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
        vm.toggleSearchModal(false);
        vm.selectedItem = -1
      }

      function backspaceHandler() {
        if (lastQuery === '') {
          searchQuery.setQuery(vm.query, '');
          searchQuery.removeLastItem();
          $state.go('app.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
          vm.toggleSearchModal(false);
        }
      }

      function trimByType(text) {
        var words = text.split(' ');
        var index;
        var typeMap = {
          user: 'from',
          place: 'in',
          label: 'label'
        };
        if (vm.queryType === 'other') {
          index = words.lastIndexOf(vm.excludedQuery);
        } else {
          index = words.lastIndexOf(typeMap[vm.queryType] + ':' + vm.excludedQuery);
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

        resetSelected(vm.suggestion.accounts);
        resetSelected(vm.suggestion.places);
        resetSelected(vm.suggestion.labels);

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
        } else if (index >= accountCount + placeCount && index < accountCount + placeCount + labelCount) {
          return {
            data: vm.suggestion.labels[index - (accountCount + placeCount)],
            type: 'label'
          }
        }
      }

      function getUniqueItems(data) {
        var result = {
          places: [],
          accounts: [],
          labels: [],
          history: []
        };
        var params = searchQuery.getSearchParams();
        var places = _.map(params.places, function (item) {
          return {
            id: item
          };
        });
        if (data.places !== undefined) {
          result.places = _.differenceBy(_.uniqBy(data.places, 'id'), places, 'id');
        }
        var users = _.map(params.users, function (item) {
          return {
            id: item
          };
        });
        if (data.accounts !== undefined) {
          result.accounts = _.differenceBy(_.uniqBy(data.accounts, 'id'), users, 'id');
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

        var placePrefix = NST_SEARCH_QUERY_PREFIX.NEW_PLACE;
        var userPrefix = NST_SEARCH_QUERY_PREFIX.NEW_USER;
        var labelPrefix = NST_SEARCH_QUERY_PREFIX.NEW_LABEL;

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
            }
          }
        } while (match);

        return {
          word: word,
          type: type
        };
      }

      function getSuggestions(query) {
        if (_.trim(query).length === 0) {
          vm.defaultSearch = true;
          vm.suggestion = vm.defaultSuggestion;
          NstSvcSuggestionFactory.search('').then(function (result) {
            vm.defaultSuggestion = getUniqueItems(result);
            vm.suggestion = Object.assign({}, vm.defaultSuggestion);
          });
        }
        else {
          vm.defaultSearch = false;
          var result = getLastItem(query);
          if (result.word === undefined || result.word === null) {
            result.word = '';
          }

          vm.excludedQuery = result.word;
          vm.queryType = result.type;

          switch (result.type) {
            case 'place':
              NstSvcPlaceFactory.searchForCompose(result.word).then(function (result) {
                vm.suggestion = getUniqueItems({places: result.places});
                vm.resultCount = countItems();
                vm.selectedItem = -1;
              });
              break;
            case 'user':
              var settings = {
                query: result.word,
                limit: 6
              };
              NstSvcUserFactory.search(settings, NST_USER_SEARCH_AREA.ACCOUNTS).then(function (result) {
                vm.suggestion = getUniqueItems({accounts: result});
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
          'place': 'in',
          'user': 'from',
          'label': 'label',
          'keyword': 'keyword'
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
        }
        $state.go('app.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
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
          case 'in':
            searchQuery.removePlace(name);
            break;
          case 'from':
            searchQuery.removeUser(name);
            break;
          case 'label':
            searchQuery.removeLabel(name);
            break;
          case 'keyword':
            searchQuery.removeKeyword(name);
            break;
        }
        $state.go('app.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
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
        $state.go('app.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
        vm.toggleSearchModal(false);
      }

      function advancedSearchIt() {
        searchQuery.setAllKeywords(this.advancedSearch.keywords);
        searchQuery.setUsers(this.advancedSearch.users);
        searchQuery.setPlaces(this.advancedSearch.places);
        searchQuery.setSubject(this.advancedSearch.subject);
        searchQuery.setLabels(this.advancedSearch.labels);
        searchQuery.setHasAttachment(this.advancedSearch.hasAttachment);

        try {
          searchQuery.setWithin(this.advancedSearch.within);
          searchQuery.setDate(this.advancedSearch.date.unix());
        } catch (e) {
          searchQuery.setWithin('-1');
        }

        $state.go('app.search', {search: NstSearchQuery.encode(searchQuery.toAdvancedString()), advanced: 'true'});
        vm.toggleSearchModal(false);
      }

      /**
       * Listen to closing notification popover event
       */
      $scope.$on('close-mention', function () {
        vm.mentionOpen = false;
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
        requsetLabelCounter();
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
