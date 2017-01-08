(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('FilesController', FilesController);

  /** @ngInject */
  function FilesController($stateParams, toastr, $uibModal, $state, $timeout, $q,
    NstSvcFileFactory, NstSvcAttachmentFactory, NstSvcPlaceFactory, NstSvcPlaceAccess, NstSvcModal, NstSvcTranslation,
    NstVmFile, NstVmFileViewerItem,
    NST_DEFAULT) {
    var vm = this;

    vm.fileTypes = [
      {
        id : 'ALL',
        label : NstSvcTranslation.get('all')
      },
      {
        id : 'DOC',
        label : NstSvcTranslation.get('documents')
      },
      {
        id : 'IMG',
        label : NstSvcTranslation.get('images')
      },
      {
        id : 'AUD',
        label : NstSvcTranslation.get('audios')
      },
      {
        id : 'VID',
        label : NstSvcTranslation.get('videos')
      },
      {
        id : 'OTH',
        label : NstSvcTranslation.get('others')
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
          NstSvcModal.error(NstSvcTranslation.get("Error"), NstSvcTranslation.get("Either this Place doesn't exist, or you don't have the permit to enter the Place.")).finally(function () {
            $state.go(NST_DEFAULT.STATE);
          });
        }
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get('Sorry, an error has occurred while loading the Place.'));
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
        toastr.error(NstSvcTranslation.get('An error has occurred while retrieving files.'));
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
      $state.go('app.place-compose', { placeId : $stateParams.placeId, attachments : vm.selectedFiles });
    }

  }
})();
