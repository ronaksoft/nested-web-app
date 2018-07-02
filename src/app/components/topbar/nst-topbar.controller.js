(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.sidebar')
    .controller('TopBarController', TopBarController);

  /** @ngInject */
  function TopBarController($q, $, $scope, $timeout, $state, $stateParams, $uibModal, NstSvcAppFactory, NstSvcViewStorage,
                            $rootScope, NST_SEARCH_QUERY_PREFIX, _, NstSvcTranslation, NstViewService, NstSvcAuth, md5,
                            NstSvcSuggestionFactory, NstSvcLabelFactory, NstSvcI18n, NstSvcTaskUtility, $sce, toastr,
                            NstSvcUserFactory, NstSvcNotificationFactory, NST_USER_SEARCH_AREA, SvcRecorder,
                            NstSvcPlaceFactory, NstSearchQuery, NST_CONFIG, NST_USER_EVENT, NST_NOTIFICATION_EVENT) {
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
    var vm = this;
    var eventReferences = [];
    vm.nightMode = false;
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
      tos: [],
      apps: []
    };
    vm.suggestion = {
      histories: [],
      places: [],
      accounts: [],
      labels: [],
      tos: [],
      apps: []
    };
    vm.limits = {
      exact: {
        places: 6,
        accounts: 6,
        labels: 6,
        tos: 6,
        apps: 6
      },
      all: {
        places: 3,
        accounts: 3,
        labels: 3,
        tos: 3,
        apps: 3
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
    vm.appsResult = [];
    vm.getAppIframeUrl = getAppIframeUrl;
    vm.appIframeEnable = false;
    vm.appIframeUrl = '';
    vm.appIframeObj = null;
    var iframeOnMessage;

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
      NstSvcUserFactory.getCurrent(true).then(function (user) {
        vm.user = user;
        if (user.authority.labelEditor) {
          requestLabelCounter();
        }
      });
      // NstSvcSuggestionFactory.search('').then(function (result) {
      //   vm.defaultSuggestion = getUniqueItems(result);
      //   vm.suggestion = Object.assign({}, vm.defaultSuggestion);
      // });

      NstViewService.getTheme().then(function (v) {
        vm.nightMode = (v === 'yes');
      });

      loadCompanyConstants();
      eventReferences.push($rootScope.$on('company-constants-loaded', function () {
        loadCompanyConstants();
      }));
    })();

    eventReferences.push($scope.$watch(function () {
      return vm.nightMode;
    }, function (val) {
      NstViewService.setTheme(val).then(function () {
        NstViewService.applyTheme();
        $rootScope.$broadcast('toggle-theme', {
          dark: val
        })
      });
    }));

    function loadCompanyConstants() {
      var data = window.companyConstants;
      if (data) {
        vm.companyConstant = _.cloneDeep(window.companyConstants);
        if (vm.companyConstant.logo !== '') {
          vm.companyConstant.logo = NST_CONFIG.STORE.URL + '/view/x/' + vm.companyConstant.logo;
        }
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
      $timeout(function () {
        scrollEndSearch();
      }, 100);
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
          vm.advancedSearch.date = searchQuery.getDate() / 1000;
        }
      } catch (e) {
        vm.advancedSearch.date = '';
      }
    }

    function empty() {
      if (vm.appIframeEnable && _.some(this.chips, {type: 'app:'})) {
        closeApp();
      }
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
      if (force === false && vm.appIframeEnable) {
        vm.appIframeEnable = false;
        closeApp();
        return
      }
      if (force === true) {
        $('body').addClass('_oh');
        vm.searchModalOpen = true;
        vm.advancedSearchOpen = false;
        return;
      } else if (force === false) {
        $('body').removeClass('_oh');
        vm.searchModalOpen = false;
        vm.advancedSearchOpen = false;
        vm.appIframeEnable = false;
        return;
      }
      $('body').toggleClass('_oh');
      vm.searchModalOpen = !vm.searchModalOpen;
      vm.advancedSearchOpen = false;
    }

    function toggleAdvancedSearch(force) {
      if (force) {
        vm.advancedSearchOpen = true;
        return;
      }
      vm.searchModalOpen = false;
      vm.advancedSearchOpen = !vm.advancedSearchOpen;
      if (!vm.advancedSearchOpen) {
        vm.searchModalOpen = true;
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
          resetSelected(vm.suggestion.apps);
        }
        return true;
      } else {
        return false;
      }
    }

    function returnKeyPressed() {
      var type = 'other';
      var app = '';
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
          case 'app':
            searchQuery.setApp(item.data.id);
            app = item.data.id;
            break;
        }
        type = item.type;
      }
      if (type === 'app') {
        loadApp(app)
      } else {
        if (isTask()) {
          $state.go('app.task.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
        } else {
          $state.go('app.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
        }
        vm.toggleSearchModal(false);
        vm.selectedItem = -1
      }
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
        to: searchPrefixLocale.to,
        app: searchPrefixLocale.app
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
      if (vm.suggestion.apps.length > getLimit('apps')) {
        count += getLimit('tos');
      } else {
        count += vm.suggestion.apps.length;
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
      var appCount = 0;
      if (vm.suggestion.apps.length > getLimit('apps')) {
        appCount = getLimit('apps');
      } else {
        appCount = vm.suggestion.apps.length;
      }

      resetSelected(vm.suggestion.accounts);
      resetSelected(vm.suggestion.places);
      resetSelected(vm.suggestion.labels);
      resetSelected(vm.suggestion.tos);
      resetSelected(vm.suggestion.apps);

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
      } else if (index >= accountCount + placeCount + toCount + labelCount && index < accountCount + placeCount + toCount + labelCount + appCount) {
        return {
          data: vm.suggestion.apps[index - (accountCount + placeCount + toCount + labelCount)],
          type: 'app'
        }
      }
    }

    function getUniqueItems(data) {
      var result = {
        places: [],
        accounts: [],
        labels: [],
        tos: [],
        apps: [],
        history: []
      };
      var params = searchQuery.getSearchParams();
      if (!isTask()) {
        if (data.places !== undefined) {
          result.places = _.differenceWith(_.uniqBy(data.places, 'id'), params.places, function (i1, i2) {
            return i1.id === i2;
          });
        }
      }
      if (data.accounts !== undefined) {
        result.accounts = _.differenceWith(_.uniqBy(data.accounts, 'id'), params.users, function (i1, i2) {
          return i1.id === i2;
        });
      }
      if (isTask()) {
        if (data.tos !== undefined) {
          result.tos = _.differenceWith(_.uniqBy(data.tos, 'id'), params.tos, function (i1, i2) {
            return i1.id === i2;
          });
        }
      }
      if (data.labels !== undefined) {
        result.labels = _.differenceWith(_.uniqBy(data.labels, 'id'), params.labels, function (i1, i2) {
          return i1.title === i2;
        });
      }
      if (data.apps !== undefined) {
        result.apps = _.differenceWith(data.apps, params.apps, function (i1, i2) {
          return i1.app.id === i2;
        });
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
      var appPrefix = searchPrefixLocale.app;

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
          } else if (_.startsWith(match[0], appPrefix)) {
            word = _.replace(match[0], appPrefix, '');
            type = 'app';
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
            if (!vm.isTask()) {
              NstSvcPlaceFactory.searchForCompose(result.word).then(function (result) {
                vm.suggestion = getUniqueItems({places: result.places});
                vm.resultCount = countItems();
                vm.selectedItem = -1;
              });
              break;
            }
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
          case 'app':
            NstSvcAppFactory.search(result.word, 0, 10).then(function (result) {
              vm.appsResult = result;
              vm.suggestion = getUniqueItems({apps: result});
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
      var category = (vm.queryType === 'other' || vm.defaultSearch) ? 'all' : 'exact';
      return vm.limits[category][type] || 3;
    }

    function initChips(params) {
      vm.chips = [];
      var types = {
        'place': searchPrefixLocale.place,
        'user': searchPrefixLocale.user,
        'label': searchPrefixLocale.label,
        'to': searchPrefixLocale.to,
        'app': searchPrefixLocale.app,
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
        case 'app':
          searchQuery.setApp(id);
          break;
      }
      if (type === 'app') {
        loadApp(id);
      } else {
        if (isTask()) {
          $state.go('app.task.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
        } else {
          $state.go('app.search', {search: NstSearchQuery.encode(searchQuery.toString()), advanced: 'false'});
        }
        vm.toggleSearchModal(false);
        vm.queryType = 'other';
      }
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
        case searchPrefixLocale.app:
          searchQuery.removeApp();
          closeApp();
          return;
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
      searchQuery.reset();
      searchQuery.setAllKeywords(this.advancedSearch.keywords);
      searchQuery.setUsers(this.advancedSearch.users);
      searchQuery.setPlaces(this.advancedSearch.places);
      searchQuery.setSubject(this.advancedSearch.subject);
      searchQuery.setLabels(this.advancedSearch.labels);
      searchQuery.setTos(this.advancedSearch.tos);
      searchQuery.setHasAttachment(this.advancedSearch.hasAttachment);

      try {
        searchQuery.setWithin(this.advancedSearch.within);
        searchQuery.setDate(this.advancedSearch.date * 1000);
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

    function getAppIframeUrl(url) {
      var urlPostFix = '?from=nested';
      return $sce.trustAsResourceUrl(url + urlPostFix);
    }

    function loadApp(appId) {
      vm.appIframeEnable = true;
      vm.chips = [{
        type: searchPrefixLocale.app,
        title: appId
      }];
      vm.newQuery = '';
      var index = _.findIndex(vm.appsResult, {id: appId});
      if (index > -1) {
        vm.appIframeUrl = vm.appsResult[index].homepage;
        initAppFrameWork();
      }
    }

    function loadAppExternally(appId) {
      NstSvcAppFactory.getAllTokens().then(function (result) {
        var apps = _.map(result, function (item) {
          return item.app;
        });
        vm.appsResult = apps;
        toggleSearchModal(true);
        vm.appIframeEnable = true;
        loadApp(appId);
      });
    }

    function closeApp() {
      vm.chips = [];
      toggleSearchModal(false);
      vm.appIframeObj = null;
      vm.appIframeUrl = '';
      if (iframeOnMessage) {
        window.removeEventListener('message', iframeOnMessage)
      }
    }

    function getUserData() {
      var user = NstSvcAuth.user || {id: '_'};
      var msgId = 'nested-main';
      var app = NST_CONFIG.DOMAIN;
      var locale = NstSvcI18n.selectedLocale;
      var darkMode = NstSvcViewStorage.get('nightMode');
      if (darkMode == false || darkMode === 'no') {
        darkMode = false;
      } else {
        darkMode = true;
      }
      return {
        userId: user.id,
        email: user.email,
        fname: user.firstName,
        lname: user.lastName,
        msgId: msgId,
        app: app,
        locale: locale,
        dark: darkMode
      }
    }

    function createHash(data) {
      var str = JSON.stringify(data);
      str = encodeURIComponent(str).split('%').join('');
      return md5.createHash(str);
    }

    function sendIframeMessage(cmd, data) {
      var msg = {
        cmd: cmd,
        data: data
      };
      var hash = createHash(msg);
      msg.hash = hash;
      if (!vm.appIframeObj) {
        vm.appIframeObj = document.getElementById('app-iframe');
      }
      vm.appIframeObj.contentWindow.postMessage(JSON.stringify(msg), '*');
    }

    function isHashValid(data) {
      var packetHash = data.hash;
      delete data.hash;
      var hash = createHash(data);
      if (hash === packetHash) {
        return true;
      } else {
        return false;
      }
    }

    function checkUrls(remoteUrl, requestedUrl) {
      return remoteUrl.indexOf(requestedUrl) > -1;
    }

    function getValidHeight(h) {
      var height = $('.search-modal .backdrop').height() - 120;
      if (h > height) {
        return height;
      } else {
        return h;
      }
    }

    function initAppFrameWork() {
      $timeout(function () {
        vm.appIframeObj = document.getElementById('app-iframe');
        var userData = getUserData();
        iframeOnMessage = function (e) {
          if (vm.appIframeUrl.indexOf(e.origin) === -1) {
            return;
          }
          var data = JSON.parse(e.data);
          if (!isHashValid(data)) {
            return;
          }
          if (checkUrls(data.url, vm.appIframeUrl)) {
            switch (data.cmd) {
              case 'getInfo':
                sendIframeMessage('setInfo', userData);
                break;
              // case 'setSize':
              //   vm.appIframeObj.style.cssText = 'height: ' + getValidHeight(data.data.height) + 'px !important';
              //   vm.appIframeObj.parentNode.style.cssText = 'height: ' + getValidHeight(data.data.height) + 'px !important';
                break;
              case 'setNotif':
                if (['success', 'info', 'warning', 'error'].indexOf(data.data.type) > -1) {
                  toastr[data.data.type](data.data.message);
                }
                break;
              case 'createToken':
                NstSvcAppFactory.createToken(data.data.clientId).then(function (res) {
                  sendIframeMessage('setLoginInfo', {
                    token: data.data.token,
                    appToken: res.token,
                    appDomain: userData.app,
                    username: userData.userId,
                    fname: userData.fname,
                    lname: userData.lname,
                    email: userData.email
                  });
                }).catch(function () {
                  toastr.warning(NstSvcTranslation.get('Can not create token for app: {0}').replace('{0}', data.data.clientId));
                });
                break;
              default:
                break;
            }
          }
        };
        window.addEventListener('message', iframeOnMessage);
      }, 1);
    }

    eventReferences.push($rootScope.$on('toggle-theme', function (event, data) {
      if (vm.appIframeEnable && vm.appIframeUrl !== '') {
        sendIframeMessage('setTheme', data);
      }
    }));

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

    function loadNotificationsCount() {
      NstSvcNotificationFactory.getNotificationsCount().then(function (count) {
        vm.notificationsCount = count;
      });
    }

    function closeProfile() {
      vm.profileOpen = false;
    }

    eventReferences.push($rootScope.$on('$stateChangeStart', function (event, toState, params) {
      if (SvcRecorder.isRecording()) {
        event.preventDefault();
        NstSvcTaskUtility.promptModal({
          title: NstSvcTranslation.get('Leave the recorder area?'),
          body: NstSvcTranslation.get('Are you sure? <br>All recorded voices will be lost'),
          confirmText: NstSvcTranslation.get('Yes'),
          confirmColor: 'red',
          cancelText: NstSvcTranslation.get('Cancel')
        }).then(function () {
          SvcRecorder.stop(true);
          $state.go(toState.name, params);
        });
      }
    }));

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
      NstSvcUserFactory.getCurrent(true).then(function (user) {
        vm.user = user;
        NstSvcPlaceFactory.removeCache(user.id);
      });
    }));

    eventReferences.push($rootScope.$on(NST_USER_EVENT.PICTURE_UPDATED, function () {
      NstSvcUserFactory.getCurrent(true).then(function (user) {
        vm.user = user;
        NstSvcPlaceFactory.removeCache(user.id);
      });
    }));

    eventReferences.push($rootScope.$on(NST_USER_EVENT.PICTURE_REMOVED, function () {
      NstSvcUserFactory.getCurrent(true).then(function (user) {
        vm.user = user;
        NstSvcPlaceFactory.removeCache(user.id);
      });
    }));

    eventReferences.push($rootScope.$on('label-request-status-changed', function () {
      requestLabelCounter();
    }));

    eventReferences.push($rootScope.$on('app-load-externally', function (event, data) {
      loadAppExternally(data.appId);
    }));

    $scope.$on('$destroy', function () {
      if (iframeOnMessage) {
        window.removeEventListener('message', iframeOnMessage)
      }

      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
