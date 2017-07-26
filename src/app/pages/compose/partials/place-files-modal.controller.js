(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('placeFilesModalController', placeFilesModalController);

  /** @ngInject */
  function placeFilesModalController($stateParams, toastr, $uibModal, $state, $timeout, $q, $scope, _,
                           NST_PLACE_ACCESS, NST_ATTACHMENT_STATUS, NstSvcAttachmentMap, NstSvcPlaceFactory,
                           NstSvcFileFactory, NstSvcPlaceAccess, NstSvcModal,
                           NstSvcTranslation, NstSvcAuth, NstSvcWait, NstSvcInteractionTracker) {
    var vm = this;
    var onSelectTimeout = null;
    var eventReferences = [];
    vm.loadMoreCounter = 0;
    vm.keyword = '';
    vm.attachments = [];
    vm.selectedFiles = [];
    vm.places = [];
    vm.breadcrumb = ['Places', 'placeName1', 'placeName1'];
    vm.files = [];
    vm.loadMoreCounter = 0;

    vm.add = add;
    vm.loadMore = loadMore;
    vm.addToCompose = addToCompose;
    vm.closePopover = closePopover;
    vm.unSelectFiles = unSelectFiles;
    vm.getSubPlace = getSubPlace;
    vm.attachClick = attachClick;

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
      console.log(111111);
      // vm.filesLoadProgress = true;
      vm.loadFilesError = false;
      vm.getSubPlace();
      
    }

    function loadMore() {
      if (vm.hasNextPage) {
        vm.loadMoreCounter++;
        NstSvcInteractionTracker.trackEvent('files', 'load more', vm.loadMoreCounter);
        load();
      }
    }

    function getSubPlace(placeId) {
      vm.settings.skip = 0;
      if ( placeId ) {
        // NstSvcPlaceFactory.getChildrens(placeId).then(function (places){
        //   vm.places = places;
        // });
        getFiles(placeId) ;
      } else {
        NstSvcPlaceFactory.getGrandPlaces().then(function (places){
          vm.places = places;
        });
      }
    }

    function attachClick(attachment) {
      console.log(attachment);
    }

    function getFiles(placeId) {
      var deferred = $q.defer();
      console.log(placeId);
      NstSvcFileFactory.get(placeId, null, '', vm.settings.skip, vm.settings.limit).then(function (fileItems) {
        console.log(fileItems);
        var newFileItems = _.differenceBy(fileItems, vm.files, 'id');
        vm.hasNextPage = fileItems.length === vm.settings.limit;
        vm.settings.skip += newFileItems.length;

        vm.files.push.apply(vm.files, newFileItems);
        // vm.loadFilesError = false;
        console.log(vm.files);
        deferred.resolve();
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get('An error has occurred while retrieving files.'));
        vm.loadFilesError = true;
        deferred.reject();
      }).finally(function () {
        // vm.filesLoadProgress = false;
      });

      return deferred.promise;
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
