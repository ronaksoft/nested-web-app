(function () {
    'use strict';

    angular
      .module('ronak.nested.web.components.sidebar')
      .controller('TopBarController', TopBarController);

    /** @ngInject */
    function TopBarController($q, $, $scope, $state, $stateParams, $uibModal, $rootScope,
                               _, NstSvcTranslation, NstSvcAuth) {
      var vm = this;
      vm.searchPlaceholder = NstSvcTranslation.get('Search...');
      vm.searchKeyPressed = searchKeyPressed;
      vm.notificationsCount = 10;
      vm.profileOpen = false;
      vm.notifOpen = false;
      vm.user = NstSvcAuth.user;
      vm.searchModalOpen = false;

      vm.toggleSearchModal = function(force) {
        if ( force ) {
          $('html').addClass('_oh');
          vm.searchModalOpen = true ;
          return;
        }
        $('html').toggleClass('_oh');
        vm.searchModalOpen =! vm.searchModalOpen ;
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
        if (vm.searchOnKeypress) {
          if (isChips) {
            if (text === undefined) {
              text = '';
            }
            if (text === '' && vm.lastChipText === '' && $event.keyCode === 8) {
              vm.removeLastChip(vm.query);
              return;
            }
            vm.searchOnKeypress($event, vm.query + ' ' + text);
            vm.lastChipText = text;
          } else {
            vm.searchOnKeypress($event, text);
          }
        }
      }
    }
  })();
