(function () {
    'use strict';

    angular
      .module('ronak.nested.web.components.sidebar')
      .controller('TopBarController', TopBarController);

    /** @ngInject */
    function TopBarController($q, $, $scope, $state, $stateParams, $uibModal, $rootScope, NST_SEARCH_QUERY_PREFIX,
                               _, NstSvcTranslation, NstSvcAuth, NstSvcSuggestionFactory, NstSvcLabelFactory, NstSvcUserFactory,
                              NST_USER_SEARCH_AREA, NstSvcPlaceFactory) {
      var vm = this;
      vm.searchPlaceholder = NstSvcTranslation.get('Search...');
      vm.searchKeyPressed = searchKeyPressed;
      vm.query = '';
      vm.excludedQuery = '';
      vm.queryType = '';
      vm.notificationsCount = 10;
      vm.profileOpen = false;
      vm.notifOpen = false;
      vm.user = NstSvcAuth.user;
      vm.searchModalOpen = false;
      vm.advancedSearchOpen = false;
      vm.debouncedSugesstion = _.debounce(getSuggestions, 500);
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
      vm.getLimit = getLimit;
      vm.resultCount = 6;
      vm.selectedItem = -1;


      (function () {
        NstSvcSuggestionFactory.search('').then(function (result) {
          vm.defaultSuggestion = getUniqueItems(result);
          vm.suggestion = vm.defaultSuggestion;
        });
      })();

      vm.toggleSearchModal = function(force) {
        if (force) {
          $('html').addClass('_oh');
          vm.searchModalOpen = true ;
          vm.advancedSearchOpen = false;
          return;
        }
        $('html').toggleClass('_oh');
        vm.searchModalOpen =! vm.searchModalOpen ;
        vm.advancedSearchOpen = false;
      };

      vm.toggleAdvancedSearch = function(force) {
        if ( force ) {
          vm.advancedSearchOpen = true ;
          return;
        }
        vm.searchModalOpen = false ;
        vm.advancedSearchOpen =! vm.advancedSearchOpen ;
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
       * @param {boolean} isChips
       */
      function searchKeyPressed($event, text, isChips) {
        if (!isNotQuery($event)) {
          vm.toggleSearchModal(true);
          vm.debouncedSugesstion(text);
        }

      //   if (vm.searchOnKeypress) {
      //     if (isChips) {
      //       if (text === undefined) {
      //         text = '';
      //       }
      //       if (text === '' && vm.lastChipText === '' && $event.keyCode === 8) {
      //         vm.removeLastChip(vm.query);
      //         return;
      //       }
      //       vm.searchOnKeypress($event, vm.query + ' ' + text);
      //       vm.lastChipText = text;
      //     } else {
      //       vm.searchOnKeypress($event, text);
      //     }
      //   }
      }

      function isNotQuery(event) {
        var keys = [13, 38, 40];
        if (keys.indexOf(event.keyCode) > -1) {
          switch (event.keyCode) {
            case 38:
              vm.selectedItem--;
              if (vm.selectedItem < 0) {
                vm.selectedItem = 0;
              }
              break;
            case 40:
              vm.selectedItem++;
              if (vm.selectedItem >= vm.resultCount) {
                vm.selectedItem = vm.resultCount - 1;
              }
              break;
          }
          if (vm.selectedItem !== -1) {
            selectItem(vm.selectedItem).data._selected = true;
          }
          return true;
        } else {
          return false;
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
        if (data.places !== undefined) {
          result.places = _.uniqBy(data.places, 'id');
        }
        if (data.accounts !== undefined) {
          result.accounts = _.uniqBy(data.accounts, 'id');
        }
        if (data.labels !== undefined) {
          result.labels = _.uniqBy(data.labels, 'id');
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
        var lastWord;
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
            } else {
              lastWord = match[0];
            }
          }
        } while (match);

        if (word.length < 1) {
          word = lastWord;
          type = 'other';
        }

        return {
          word: word,
          type: type
        };
      }

      function getSuggestions(query) {
        if (_.trim(query).length === 0) {
          vm.defaultSearch = true;
          vm.suggestion = vm.defaultSuggestion;
        }
        else {
          var result = getLastItem(query);
          vm.excludedQuery = result.word;
          vm.queryType = result.type;

          switch (result.type) {
            case 'place':
              NstSvcPlaceFactory.searchForCompose(result.word).then(function (result) {
                vm.suggestion = getUniqueItems({places: result.places});
                vm.resultCount = countItems();
                vm.defaultSearch = false;
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
                vm.defaultSearch = false;
                vm.selectedItem = -1;
              });
              break;
            case 'label':
              NstSvcLabelFactory.search(result.word).then(function (result) {
                vm.suggestion = getUniqueItems({labels: result});
                vm.resultCount = countItems();
                vm.defaultSearch = false;
                vm.selectedItem = -1;
              });
              break;
            case 'other':
              NstSvcSuggestionFactory.search(result.word).then(function (result) {
                vm.suggestion = getUniqueItems(result);
                vm.resultCount = countItems();
                vm.defaultSearch = false;
                vm.selectedItem = -1;
              });
              break;
          }
        }
      }

      function getLimit(type) {
        var category = (vm.queryType === 'other' || vm.defaultSearch) ? 'all': 'exact';
        return vm.limits[category][type];
      }
    }
  })();
