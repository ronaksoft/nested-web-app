/**
 * @file src/app/files/files.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description A place files
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-07
 * Reviewed by:            -
 * Date of review:         -
 */

(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('FilesController', FilesController);

  function FilesController($stateParams, toastr, $uibModal, $state, $timeout, $q, $scope,
                           NST_PLACE_ACCESS,
                           NstSvcFileFactory, NstSvcPlaceAccess, NstSvcModal,
                           NstSvcTranslation, NstSvcAuth, _, NstSvcInteractionTracker,
                           NST_DEFAULT) {
    var vm = this;
    var eventReferences = [];
    vm.loadMoreCounter = 0;
    vm.keyword = '';

    vm.searchFunc = function () {

      if (vm.keyword.length > 0) {
        vm.keyword = '';
        search(vm.keyword);
      } else {
        if (vm.searchTrigg) {
          ++vm.searchTrigg;
        } else {
          vm.searchTrigg = 0;
        }
      }

    };

    vm.fileTypes = [
      {
        id: 'ALL',
        label: NstSvcTranslation.get('all')
      },
      {
        id: 'DOC',
        label: NstSvcTranslation.get('documents')
      },
      {
        id: 'IMG',
        label: NstSvcTranslation.get('images')
      },
      {
        id: 'AUD',
        label: NstSvcTranslation.get('audios')
      },
      {
        id: 'VID',
        label: NstSvcTranslation.get('videos')
      },
      {
        id: 'OTH',
        label: NstSvcTranslation.get('others')
      }
    ];

    vm.search = _.debounce(search, 512);
    vm.filter = filter;
    vm.preview = preview;
    vm.loadMore = loadMore;
    vm.compose = composeWithAttachments;
    vm.isSubPersonal = isSubPersonal;
    vm.toggleSelect = toggleSelect;
    vm.unselectFile = unselectFile;
    vm.unselectAll = unselectAll;

    vm.selectedFiles = [];
    vm.files = [];
    vm.hasPreviousPage = false;
    vm.hasNextPage = false;
    vm.currentPlaceId = null;

    var defaultSettings = {
      filter: 'ALL',
      keyword: '',
      skip: 0,
      limit: 40
    };

    vm.settings = {};

    (function () {
      vm.currentPlaceId = $stateParams.placeId;
      vm.selectedFileType = getSelectedFilter();
      vm.settings = {
        filter: vm.selectedFileType.id,
        search: getSearchParameter() || defaultSettings.search,
        skip: defaultSettings.skip,
        limit: defaultSettings.limit
      };

      if (!$stateParams.placeId || $stateParams.placeId === NST_DEFAULT.STATE_PARAM) {
        throw Error('Could not find Place Id.');
      }

      vm.currentPlaceId = $stateParams.placeId;
      // Loads the place, then retrieves the place files. Dispatches 'main-done' to tell the other components
      // that the main component is done.
      NstSvcPlaceAccess.getIfhasAccessToRead(vm.currentPlaceId).then(function (place) {
        if (place) {
          vm.currentPlace = place;
          vm.currentPlaceLoaded = true;

          vm.hasSeeMembersAccess = place.hasAccess(NST_PLACE_ACCESS.SEE_MEMBERS);
          vm.showPlaceId = place.privacy && !_.includes(['off', 'internal'], place.privacy.receptive);

          load();
        } else {
          NstSvcModal.error(NstSvcTranslation.get("Error"), NstSvcTranslation.get("Either this Place doesn't exist, or you don't have the permit to enter the Place.")).finally(function () {
            $state.go(NST_DEFAULT.STATE);
          });
        }
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('Sorry, an error has occurred while loading the Place.'));
      });

    })();

    /**
     * Returns true if the place is a personal or sub-personal one
     *
     * @returns
     */
    function isSubPersonal() {
      if (vm.currentPlaceId) {
        var currentUserId = vm.currentPlaceId.split('.')[0];
        if (NstSvcAuth.user !== undefined) {
          return NstSvcAuth.user.id === currentUserId;
        } else {
          return false;
        }
      }
    }

    function search(keyword) {
      vm.settings.keyword = keyword;
      vm.settings.skip = 0;
      vm.files = [];

      load();
    }

    /**
     * Retrieves the files with the applied filter
     *
     * @param {any} filter
     */
    function filter(filter) {
      vm.selectedFileType = filter;
      vm.settings.filter = filter.id;
      vm.files = [];
      load();
    }

    /**
     * Returns the matched predefined filter with the provided key in URL
     *
     * @returns
     */
    function getSelectedFilter() {
      var value = _.toLower($stateParams.filter);

      return _.find(vm.fileTypes, function (fileType) {
        return _.toLower(fileType.label) === value;
      }) || vm.fileTypes[0];
    }

    /**
     * Returns the value of `search` parameter in URL
     *
     * @returns
     */
    function getSearchParameter() {
      var value = $stateParams.search;
      if (!value || value === NST_DEFAULT.STATE_PARAM) {
        return null;
      }

      return decodeURIComponent(value);
    }

    function merge(newFiles) {
      var newItems = _.differenceBy(newFiles, vm.files, 'id');
      var removedItems = _.differenceBy(vm.files, newFiles, 'id');

      // first omit the removed items; The items that are no longer exist in fresh newFiles
      _.forEach(removedItems, function (item) {
        var index = _.findIndex(vm.files, { 'id': item.id });
        if (index > -1) {
          vm.files.splice(index, 1);
        }
      });

      // add new items; The items that do not exist in cached items, but was found in fresh newFiles
      vm.files.unshift.apply(vm.files, newItems);

    }

    function append(newFiles) {
      vm.files.push.apply(vm.files, newFiles);
    }

    /**
     * Retrieves a list of files by the given limit, skip, keyword and filter
     * and specifies that there are more files or not
     *
     * @returns
     */
    function load() {
      vm.filesLoadProgress = true;
      vm.loadFilesError = false;

      return NstSvcFileFactory.getPlaceFiles(vm.currentPlaceId,
        vm.settings.filter,
        vm.settings.keyword,
        vm.settings.skip,
        vm.settings.limit, function(cachedFiles) {
          vm.files = cachedFiles;
          vm.filesLoadProgress = false;
        }).then(function (fileItems) {
        merge(fileItems);

        vm.hasNextPage = fileItems.length === vm.settings.limit;
        vm.settings.skip = vm.files.length;

        vm.loadFilesError = false;
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('An error has occurred while retrieving files.'));
        vm.loadFilesError = true;
      }).finally(function () {
        vm.filesLoadProgress = false;
      });
    }

    /**
     * Opens the attachment viewer modal
     *
     * @param {any} file
     */
    function preview(file) {

      $uibModal.open({
        animation: false,
        templateUrl: 'app/components/attachments/view/single/main.html',
        controller: 'AttachmentViewController',
        controllerAs: 'ctlAttachmentView',
        backdropClass: 'attachmdrop',
        openedClass : ' modal-open-attachment-view attach-modal',
        windowClass: '_oh',
        size: 'full',
        resolve: {
          fileViewerItem: function () {
            return file;
          },
          fileViewerItems: function () {
            return vm.files;
          },
          fileId: function () {
            return null;
          },
          fileIds: function () {
            return null;
          },
          currentPlaceId: function () {
            return vm.currentPlaceId;
          },
          currentPostId: function () {
            return null;
          }
        }
      });

    }

    /**
     * Loads more files
     *
     */
    function loadMore() {
      if (!vm.hasNextPage) {
        return;
      }

      NstSvcInteractionTracker.trackEvent('files', 'load more', vm.loadMoreCounter);
      vm.loadMoreCounter++;
      vm.filesLoadProgress = true;
      vm.loadFilesError = false;

      NstSvcFileFactory.getPlaceFiles(vm.currentPlaceId,
        vm.settings.filter,
        vm.settings.keyword,
        vm.settings.skip,
        vm.settings.limit).then(function (fileItems) {
          append(fileItems);

          vm.hasNextPage = fileItems.length === vm.settings.limit;
          vm.settings.skip += fileItems.length;

          vm.loadFilesError = false;
        }).catch(function () {
          toastr.error(NstSvcTranslation.get('An error has occurred while retrieving files.'));
          vm.loadFilesError = true;
        }).finally(function () {
          vm.filesLoadProgress = false;
        });
    }

    /**
     * Adds the selected item to selected files list and calculates the total immediately size
     *
     * @param {any} fileIds
     * @param {any} el
     */
    function calculateSize() {
      var sizes = _.map(vm.selectedFiles, 'size');
      vm.totalSelectedFileSize = _.sum(sizes);
    }

    function toggleSelect(item){
      if ( item.isSelected ) {
        unselectFile(item)
      } else {
        selectFile(item)
      }
      calculateSize();
    }

    function unselectFile(item){
      _.remove(vm.selectedFiles, function(file) {
        return item.id === file.id
      });
      item.isSelected = false;
    }

    function selectFile(item){
      vm.selectedFiles.push(item);
      item.isSelected = true;
    }

    function unselectAll() {
      vm.selectedFiles.forEach(function (file) {
        file.isSelected = false;
      });
      vm.selectedFiles = [];
    }

    /**
     * Opens a compose modal with the selected attachments
     *
     */
    function composeWithAttachments() {
      $state.go('app.compose', {attachments: vm.selectedFiles}, {notify: false});
    }
    eventReferences.push($scope.$on('scroll-reached-bottom', function () {
      vm.loadMore()
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
