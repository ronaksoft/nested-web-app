(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('placeFilesModalController', placeFilesModalController);

  /** @ngInject */
  function placeFilesModalController( toastr, $uibModal, $timeout, $q, $scope, _, NstSvcPlaceFactory,
                           NstSvcFileFactory, uploadfiles,
                           NstSvcTranslation) {
    var vm = this;
    vm.selectedFiles = [];
    vm.places = [];
    vm.breadcrumb = [{
      id: '',
      name: NstSvcTranslation.get('Places'),
      visible: true
    }];
    vm.files = [];
    vm.loadMoreCounter = 0;

    vm.loadMore = loadMore;
    vm.addToCompose = addToCompose;
    vm.closePopover = closePopover;
    vm.breadcrumbClick = breadcrumbClick;
    vm.unSelectFiles = unSelectFiles;
    vm.getSubPlace = getSubPlace;
    vm.attachClick = attachClick;
    vm.selectToggle = selectToggle;
    vm.placeClick = placeClick;
    vm.isGrandPlace = isGrandPlace;

    vm.isLoading = false;
    vm.isLoadingPlaces = true;
    vm.isLoadingMore = false;
    vm.hasNextPage = false;
    vm.initialStart = true;

    /**
     * Default params for Api call
     */
    vm.settings = {
      skip: 0,
      limit: 16
    };
    load();

    /**
     * Initialize data on first mounting
     */
    function load() {
      // vm.filesLoadProgress = true;
      vm.loadFilesError = false;
      vm.getSubPlace();

    }

    /**
     * Load more files on modal
     * @param {string} placeId
     */
    function loadMore(placeId) {
      if (vm.hasNextPage && !vm.isLoading && vm.settings.skip > 0) {
        vm.loadMoreCounter++;
        // NstSvcInteractionTracker.trackEvent('files', 'load more', vm.loadMoreCounter);
        vm.isLoadingMore = true;
        if ( vm.breadcrumb.length > 1 ) {
          getFiles(placeId ? placeId : vm.breadcrumb[vm.breadcrumb.length - 1].id);
        }
      }
    }

    /**
     * Get subplaces of given placeId
     * if no place id is passed it returns the grand places
     * @param {any} placeId
     */
    function getSubPlace(placeId) {
      vm.isLoading = true;
      vm.isLoadingPlaces = true;
      vm.settings.skip = 0;
      vm.files = [];
      vm.places = [];
      if ( placeId && placeId.length > 0 ) {
        NstSvcPlaceFactory.getGrandPlaceChildren(placeId).then(function (places){
          vm.places = _.sortBy(places, [function(o) { return o.id; }]);
          // vm.places = places;
          vm.isLoadingPlaces = false;
          vm.initialStart = false;
          getFiles(placeId) ;
        });
      } else {
        NstSvcPlaceFactory.getGrandPlaces().then(function (places){
          vm.places = places;
          vm.initialStart = false;
          vm.isLoading = false;
          vm.isLoadingPlaces = false;
        });
      }
    }

    /**
     * Checks the given id is grand place
     * @param {any} id
     * @returns
     */
    function isGrandPlace(id) {
      return id.indexOf('.') === -1;
    }

    /**
     * Triggers on clicking place items
     * @param {any} placeId
     * @param {any} placeName
     * @returns
     */
    function placeClick(placeId, placeName) {
      vm.initialStart = true;
      if ( vm.selectedFiles.length > 0 ) {return;}
      getSubPlace(placeId);
      var item = _.find(vm.breadcrumb, function(o){
        return o.id === placeId
      });
      if (item) {
        vm.breadcrumb = _.dropRight(vm.breadcrumb, vm.breadcrumb.length - vm.breadcrumb.indexOf(item) - 1);
      } else {
        vm.breadcrumb.push({
          id: placeId,
          name: placeName,
          visible: true
        });
      }
      appearBreadcrumb();
    }

    /**
     * Unselect all files
     */
    function unSelectFiles() {
      vm.selectedFiles.forEach(function(o){
        o.selected = false;
      });
      vm.selectedFiles = [];
    }

    /**
     * Triggers on clicking breadcrumb item
     * @param {any} breadcrumb
     */
    function breadcrumbClick(breadcrumb) {
      placeClick(breadcrumb.id, breadcrumb.name);
    }

    function attachClick(attachment) {
      if (vm.selectedFiles.length === 0 || (vm.selectedFiles.length === 1 && vm.selectedFiles[0].id === attachment.id && !vm.selectedFiles[0].selected ) ) {
        openAttachment(attachment);
      } else {
        selectToggle(null, attachment);
      }
    }

    /**
     * Toggles the selected state of attachment
     * @param {any} e
     * @param {any} attachment
     */
    function selectToggle(e, attachment) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      /**
       * maybe the property not defined
       */
      if (attachment.selected) {
        attachment.selected = false;
        vm.selectedFiles = _.remove(vm.selectedFiles, function(item){
          return item.id !== attachment.id;
        });
      } else {
        attachment.selected = true;
        vm.selectedFiles.push(attachment);
      }
    }

    /**
     * get files of given placeID with defined skip and limits
     * @param {string} placeId
     * @returns
     */
    function getFiles(placeId) {
      var deferred = $q.defer();
      NstSvcFileFactory.getPlaceFiles(placeId, null, '', vm.settings.skip, vm.settings.limit).then(function (fileItems) {
        var newFileItems = _.differenceBy(fileItems, vm.files, 'id');
        vm.hasNextPage = fileItems.length === vm.settings.limit;
        vm.settings.skip += newFileItems.length;

        $timeout(function(){
          vm.files.push.apply(vm.files, newFileItems);
        },100)
        // vm.loadFilesError = false;
        deferred.resolve();
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('An error has occurred while retrieving files.'));
        vm.loadFilesError = true;
        deferred.reject();
      }).finally(function () {
        vm.isLoading = false;
        vm.isLoadingMore = false;
      });

      return deferred.promise;
    }

    function addToCompose() {
      uploadfiles(vm.selectedFiles);
      vm.closePopover();
    }

    /**
     * make appear first , last and before last item place id in breadcrumb
     */
    function appearBreadcrumb() {
      vm.breadcrumb.forEach(function(o){
        o.visible = false;

      });
      vm.breadcrumb[0].visible = true;
      if ( vm.breadcrumb[vm.breadcrumb.length - 2]) {vm.breadcrumb[vm.breadcrumb.length - 2].visible = true;}
      if ( vm.breadcrumb[vm.breadcrumb.length - 1]) {vm.breadcrumb[vm.breadcrumb.length - 1].visible = true;}
    }

    /**
     * ‌represents the attachment modal of attachment
     * @param {any} attachment
     * @returns
     */
    function openAttachment(attachment){
      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/components/attachments/view/single/main.html',
        controller: 'AttachmentViewController',
        controllerAs: 'ctlAttachmentView',
        backdropClass : 'attachmdrop',
        openedClass : ' modal-open-attachment-view attach-modal',
        windowClass: '_oh',
        size: 'full',
        resolve: {
          fileViewerItem : function () {
            return attachment;
          },
          fileViewerItems : function () {
            return vm.files;
          },
          fileId : function () {
            return null;
          },
          fileIds : function () {
            return null;
          },
          currentPlaceId: function () {
            return null;
          },
          currentPostId: function () {
            return null;
          }
        }
      }).result.catch(function(){
      });

      return modal.result;
    }

    /**
     * Close the Modal
     * @ TODO change the name
     */
    function closePopover() {
      $scope.$dismiss();
    }
  }
})();
