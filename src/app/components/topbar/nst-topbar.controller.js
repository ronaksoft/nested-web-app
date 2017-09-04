(function () {
    'use strict';

    angular
      .module('ronak.nested.web.components.sidebar')
      .controller('TopBarController', TopBarController);

    /** @ngInject */
    function TopBarController($q, $, $scope, $state, $stateParams, $uibModal, $rootScope, NST_SEARCH_QUERY_PREFIX,
                               _, NstSvcTranslation, NstSvcAuth, NstSvcSuggestionFactory) {
      var vm = this;
      vm.searchPlaceholder = NstSvcTranslation.get('Search...');
      vm.searchKeyPressed = searchKeyPressed;
      vm.query = '';
      vm.notificationsCount = 10;
      vm.profileOpen = false;
      vm.notifOpen = false;
      vm.user = NstSvcAuth.user;
      vm.searchModalOpen = false;
      vm.advancedSearchOpen = false;
      vm.debouncedSugesstion = _.debounce(getLastItem, 500);
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


      (function () {
        NstSvcSuggestionFactory.searchSuggestion('').then(function (result) {
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
        vm.toggleSearchModal(true);
        vm.debouncedSugesstion(text);

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

      function getUniqueItems(data) {
        var result = {
          places: [],
          accounts: [],
          labels: [],
          history: []
        };
        result.places = _.uniqBy(data.places, 'id');
        result.accounts = _.uniqBy(data.accounts, 'id');
        result.labels = _.uniqBy(data.labels, 'id');
        result.histories = data.histories;
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

        if (_.trim(query).length === 0) {
          vm.defaultSearch = true;
          vm.suggestion = vm.defaultSuggestion;
        } else {
          NstSvcSuggestionFactory.searchSuggestion(word).then(function (result) {
            // console.log(result);
            vm.suggestion = getUniqueItems(result);
            vm.defaultSearch = false;
          });
        }

        return {
          word: word,
          type: type
        };
      }
    }
  })();
