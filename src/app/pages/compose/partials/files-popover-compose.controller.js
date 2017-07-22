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
    var onSelectTimeout = null;
    var eventReferences = [];
    vm.loadMoreCounter = 0;
    vm.keyword = '';
    vm.attachments = [];
    vm.selectedFiles = [];
    vm.files = [];
    vm.loadMoreCounter = 0;

    vm.add = add;
    vm.loadMore = loadMore;
    vm.addToCompose = addToCompose;
    vm.closePopover = closePopover;
    vm.unSelectFiles = unSelectFiles;

    vm.hasPreviousPage = false;
    vm.hasNextPage = false;
    vm.currentPlaceId = null;

    vm.settings = {
      skip: 0,
      limit: 16
    };
    load();


    function add(item) {
      item.isSelected = !item.isSelected;
      if ( item.isSelected ) {
        vm.selectedFiles.push(item);
      } else {
        vm.selectedFiles.splice(vm.selectedFiles.indexOf(item), 1);
      }
    }

    function load() {
      vm.filesLoadProgress = true;
      vm.loadFilesError = false;

      var deferred = $q.defer();

      NstSvcFileFactory.recentFiles(vm.settings.skip,
        vm.settings.limit).then(function (fileItems) {
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

      return deferred.promise;
    }

    function loadMore() {
      if (vm.hasNextPage) {
        vm.loadMoreCounter++;
        NstSvcInteractionTracker.trackEvent('files', 'load more', vm.loadMoreCounter);
        load();
      }
    }

    function addToCompose() {
      $scope.$parent.$parent.ctlCompose.addUploadedAttachs(vm.selectedFiles);
    }

    function unSelectFiles() {
      vm.selectedFiles = [];
    }

    function closePopover() {
      $scope.$parent.$parent.ctlCompose.filesPopver = false;
    }

    $scope.$on('$destroy', function () {
      if (onSelectTimeout) {
        $timeout.cancel(onSelectTimeout);
      }

      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });

    });

  }
})();
