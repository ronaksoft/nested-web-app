(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('FilesController', FilesController);

  /** @ngInject */
  function FilesController($stateParams, toastr, $uibModal, $state,
    NstSvcFileFactory, NstSvcAttachmentFactory,
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
        label : 'document'
      },
      {
        id : 'IMG',
        label : 'photo'
      },
      {
        id : 'AUD',
        label : 'audio'
      },
      {
        id : 'VID',
        label : 'video'
      },
      {
        id : 'OTH',
        label : 'others'
      }
    ];

    vm.search = _.debounce(search, 512);
    vm.filter = filter;
    vm.preview = preview;
    vm.nextPage = nextPage;
    vm.previousPage = previousPage;
    vm.selectedFiles = [];
    vm.hasPreviousPage = false;
    vm.hasNextPage = false;
    vm.compose = composeWithAttachments;

    var currentPlaceId,
        defaultSettings = {
          filter : 'ALL',
          keyword : '',
          skip : 0,
          limit : 12
        };

    vm.settings = {};

    (function () {
      vm.settings = {
        filter : getFilterParameter() || defaultSettings.filter,
        search : getSearchParameter() || defaultSettings.search
      };

      if (!$stateParams.placeId || $stateParams.placeId === NST_DEFAULT.STATE_PARAM) {
        throw Error('Could not find Place Id.');
      }

      currentPlaceId = $stateParams.placeId;
      vm.settings = defaultSettings;

      load();
    })();

    function search(keyword) {
      vm.settings.keyword = keyword;

      load();
    }

    function filter(filter) {
      vm.settings.filter = filter;

      load();
    }

    function getFilterParameter() {
      var value = _.toLower($stateParams.filter);
      if (_.some(vm.fileTypes, { label : value })) {
        return value;
      }

      return null;
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
      NstSvcFileFactory.get(currentPlaceId,
        vm.settings.filter,
        vm.settings.keyword,
        vm.settings.skip,
        vm.settings.limit).then(function (files) {
          vm.files = mapFiles(files);
          vm.hasNextPage = vm.files.length >= vm.settings.limit;
          vm.hasPreviousPage = vm.settings.skip >= vm.settings.limit;
      }).catch(function (error) {
        toastr.error('An error happened while retreiving files.')
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

    function nextPage() {
      vm.settings.skip += vm.settings.limit;

      load();
    }

    function previousPage() {
      if (vm.settings.skip >= vm.settings.limit) {
        vm.settings.skip -= vm.settings.limit;
      } else {
        vm.settings.skip = 0;
      }

      load();
    }

    vm.onSelect = function (fileIds, el) {
      var selectedFiles = [];
      for (var i = 0; i < fileIds.length; i++) {
        var fileObj = vm.files.filter(function (file) {
          return file.id === parseInt(fileIds[i]);
        });
        if (fileObj.length === 1) {
          selectedFiles.push(fileObj[0]);
        }
      }
      vm.selectedFiles = selectedFiles;
    };

    vm.totalSelectedFileSize = function () {
      var total = 0;
      vm.selectedFiles.map(function (file) {
        total += file.size;
      });

      return total;
    }

    function composeWithAttachments(files) {
      var attachmentIds = [];
      if (_.isArray(files)) {
        attachmentIds = _.map(files, 'id');
      } else if (_.isObject(files) && files.id) {
        attachmentIds.push(files.id);
      }

      if (attachmentIds.length > 0) {
        $state.go('app.place-compose', { placeId : $stateParams.placeId, attachments : attachmentIds });
      }
    }

  }
})();
