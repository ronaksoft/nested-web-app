(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('FilesController', FilesController);

  /** @ngInject */
  function FilesController($stateParams, toastr, $uibModal, $state, $timeout, $q,
    NstSvcFileFactory, NstSvcAttachmentFactory, NstSvcPlaceFactory, NstSvcPlaceAccess, NstSvcModal,
    NstVmFile, NstVmFileViewerItem,
    NST_DEFAULT) {
    var vm = this;

    vm.fileTypes = [
      {
        id : 'ALL',
        label : 'all'
      },
      {
        id : 'DOC',
        label : 'documents'
      },
      {
        id : 'IMG',
        label : 'images'
      },
      {
        id : 'AUD',
        label : 'audios'
      },
      {
        id : 'VID',
        label : 'videos'
      },
      {
        id : 'OTH',
        label : 'others'
      }
    ];

    vm.search = _.debounce(search, 512);
    vm.filter = filter;
    vm.preview = preview;
    vm.loadMore = loadMore;
    vm.onSelect = onSelect;
    vm.compose = composeWithAttachments;

    vm.selectedFiles = [];
    vm.files = [];
    vm.hasPreviousPage = false;
    vm.hasNextPage = false;
    vm.currentPlaceId = null;

    var defaultSettings = {
          filter : 'ALL',
          keyword : '',
          skip : 0,
          limit : 12
        };

    vm.settings = {};

    (function () {
      vm.currentPlaceId = $stateParams.placeId;
      vm.selectedFileType = getSelectedFilter();
      vm.settings = {
        filter : vm.selectedFileType.id,
        search : getSearchParameter() || defaultSettings.search,
        skip : defaultSettings.skip,
        limit : defaultSettings.limit
      };

      if (!$stateParams.placeId || $stateParams.placeId === NST_DEFAULT.STATE_PARAM) {
        throw Error('Could not find Place Id.');
      }

      vm.currentPlaceId = $stateParams.placeId;

      NstSvcPlaceAccess.getIfhasAccessToRead(vm.currentPlaceId).then(function (place) {
        if (place) {
          vm.currentPlace = place;
          vm.currentPlaceLoaded = true;
          vm.showPlaceId = !_.includes(['off', 'internal'], place.privacy.receptive);

          load();
        } else {
          NstSvcModal.error("Error", "The place does not exist or you are not allowed to be there.").finally(function () {
            $state.go(NST_DEFAULT.STATE);
          });
        }
      }).catch(function (error) {
        toastr.error('Sorry, an error happened while getting the place.');
      });

    })();

    function search(keyword) {
      vm.settings.keyword = keyword;
      vm.settings.skip = 0;
      vm.files = [];
      load();
    }

    function filter(filter) {
      vm.selectedFileType = filter;
      vm.settings.filter = filter.id;
      vm.files = [];
      load();
    }

    function getSelectedFilter() {
      var value = _.toLower($stateParams.filter);

      return _.find(vm.fileTypes, function (fileType) {
        return _.toLower(fileType.label) === value;
      }) || vm.fileTypes[0];
    }

    function getSearchParameter() {
      var value = $stateParams.search;
      if (!value || value === NST_DEFAULT.STATE_PARAM) {
        return null;
      }

      return decodeURIComponent(value);
    }

    function load() {
      vm.filesLoadProgress = true;
      vm.loadFilesError = false;

      NstSvcFileFactory.get(vm.currentPlaceId,
        vm.settings.filter,
        vm.settings.keyword,
        vm.settings.skip,
        vm.settings.limit).then(function (files) {
          var fileItems = mapFiles(files);
          var newFileItems = _.differenceBy(fileItems, vm.files, 'id');

          vm.hasNextPage = fileItems.length === vm.settings.limit;
          vm.settings.skip += newFileItems.length;

          vm.files.push.apply(vm.files, newFileItems);
          vm.loadFilesError = false;
      }).catch(function (error) {
        toastr.error('An error happened while retreiving files.');
        vm.loadFilesError = true;
      }).finally(function () {
        vm.filesLoadProgress = false;
      });
    }

    function mapFiles(files) {
      return _.map(files, function (file) {
        return new NstVmFile(file);
      });
    }

    function mapToFileViewerItem(fileViewModel) {
      return new NstVmFileViewerItem(fileViewModel);
    }

    function preview(file) {

      // NstSvcFileFactory.getDownloadToken(file.id).then(function (token) {
      //   console.log(token);
      // });

      $uibModal.open({
        animation: false,
        templateUrl: 'app/components/attachments/view/single/main.html',
        controller: 'AttachmentViewController',
        controllerAs: 'ctlAttachmentView',
        size: 'mlg',
        resolve: {
          fileViewerItem : function () {
            return mapToFileViewerItem(file);
          },
          fileViewerItems : function () {
            return _.map(vm.files, mapToFileViewerItem);
          },
          fileId : function () {
            return null;
          },
          fileIds : function () {
            return null;
          }
        }
      });

    }

    function loadMore() {
      if (vm.hasNextPage) {
        load();
      }
    }

    function onSelect(fileIds, el) {
      $timeout(function () {
        vm.selectedFiles = _.filter(vm.files, function (file) {
          return _.includes(fileIds, file.id);
        });

        var sizes = _.map(vm.selectedFiles, 'size');
        vm.totalSelectedFileSize = _.sum(sizes);
      });
    };

    function composeWithAttachments() {
      $state.go('app.place-compose', { placeId : $stateParams.placeId, attachments : _.map(vm.selectedFiles, 'id') });
    }

  }
})();
