(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('filesPopoverComposeController', filesPopoverComposeController);

  /** @ngInject */
  function filesPopoverComposeController($stateParams, toastr, $uibModal, $state, $timeout, $q, $scope, _,
                           NST_PLACE_ACCESS, NST_ATTACHMENT_STATUS, NstSvcAttachmentMap,
                           NstSvcFileFactory, NstSvcPlaceAccess, NstSvcModal,
                           NstSvcTranslation, NstSvcAuth, NstSvcWait, NstSvcInteractionTracker,
                           NstAttachment) {
    var vm = this;
    vm.loadMoreCounter = 0;
    vm.selectedFiles = [];
    vm.files = [];
    vm.placeFiles = placeFiles;

    vm.add = add;
    vm.loadMore = loadMore;
    vm.addToCompose = addToCompose;
    vm.closePopover = closePopover;
    vm.unSelectFiles = unSelectFiles;

    vm.hasPreviousPage = false;
    vm.hasNextPage = false;
    vm.currentPlaceId = null;

    /**
     * Default params for Api call
     */
    vm.settings = {
      skip: 0,
      limit: 16
    };
    load();

    /**
     * @function
     * Add an item to the Selected files Array
     * @param {any} item
     */
    function add(item) {
      item.isSelected = !item.isSelected;
      if ( item.isSelected ) {
        vm.selectedFiles.push(item);
      } else {
        vm.selectedFiles.splice(vm.selectedFiles.indexOf(item), 1);
      }
    }

    /**
     * @function
     * loads the files of the popover for all pages
     * @returns {Promise}
     */
    function load() {
      vm.filesLoadProgress = true;
      vm.loadFilesError = false;

      var deferred = $q.defer();
      /**
       * we fill up the items with recent files api
       * Passes the skip, limit and a callback function to
       * handles the new items which was not in cache
       */
      NstSvcFileFactory.recentFiles(vm.settings.skip,
        vm.settings.limit,callback).then(function (fileItems) {
        var newFileItems = _.differenceBy(fileItems, vm.files, 'id');
        vm.hasNextPage = fileItems.length === vm.settings.limit;
        vm.settings.skip += newFileItems.length;
        vm.files.push.apply(vm.files, newFileItems);
        vm.loadFilesError = false;
        deferred.resolve();
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get('An error has occurred while retrieving files.'));
        vm.loadFilesError = true;
        deferred.reject();
      }).finally(function () {
        vm.filesLoadProgress = false;
      });

      /**
       * @function
       * This function brings the server Api items on first load and do
       * not trigger on vm.skip > limit .
       * abstracts items from controller files , and adds them on top of
       * controller files .
       * @param {Array<object>} fileItems
       */
      function callback(fileItems){
        // certainly this function do not call on next pages load request
        if ( vm.settings.skip === 0 ) {
          setTimeout(function(){
            var newFileItems = _.differenceBy(fileItems, vm.files, 'id');
            if (newFileItems.length > 0) {
              vm.files.unshift(newFileItems);
              vm.settings.skip += newFileItems.length;
            }
          },100);
        }
      }

      return deferred.promise;
    }

    /**
     * @function
     * For load more this function be calling
     */
    function loadMore() {
      if (vm.hasNextPage) {
        vm.loadMoreCounter++;
        // NstSvcInteractionTracker.trackEvent('files', 'load more', vm.loadMoreCounter);
        load();
      }
    }

    /**
     * @function
     * @callback
     * Adds selected items to the compose ( which is the parent scope of `this` )
     */
    function addToCompose() {
      $scope.$parent.$parent.ctlCompose.addUploadedAttachs(vm.selectedFiles);
    }

    /**
     * Unselects all selected files
     * @param {event} e
     */
    function unSelectFiles(e) {
      e.stopPropagation();
      vm.selectedFiles.forEach(function(o){
        o.isSelected = false;
      })
      vm.selectedFiles = [];
    }

    /**
     * Opens the placeFiles modal
     * Pass the `addToCompose` function to the new modal
     */
    function placeFiles() {
      $uibModal.open({
        animation: false,
        backdropClass: 'comdrop',
        size: 'sm',
        templateUrl: 'app/pages/compose/partials/place-files-modal.html',
        controller: 'placeFilesModalController',
        controllerAs: 'ctrl',
        resolve: {
          uploadfiles: function () {
            return $scope.$parent.$parent.ctlCompose.addUploadedAttachs;
          }
        }
      });
    }

    /**
     * Calls for closing the popover
     */
    function closePopover() {
      $scope.$parent.$parent.ctlCompose.filesPopver = false;
    }

  }
})();