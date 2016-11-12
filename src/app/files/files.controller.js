(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('FilesController', FilesController);

  /** @ngInject */
  function FilesController($stateParams, toastr,
    NstSvcFileFactory, NstSvcAttachmentFactory,
    NstVmFile,
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
    vm.download = download;
    vm.selectedFiles = [];

    var currentPlaceId,
        defaultSettings = {
          filter : 'ALL',
          keyword : '',
          skip : 0,
          limit : 24
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
      NstSvcFileFactory.get(currentPlaceId,
        vm.settings.filter,
        vm.settings.keyword,
        vm.settings.skip,
        vm.settings.limit).then(function (files) {
        vm.files = mapFiles(files);
      }).catch(function (error) {
        toastr.error('An error happened while retreiving files.')
      });
    }

    function mapFiles(files) {
      return _.map(files, function (file) {
        return new NstVmFile(file);
      });
    }

    function download(file) {
      NstSvcFileFactory.getDownloadToken(file.id).then(function (token) {
        var model = NstSvcFileFactory.getOne(file.id);
        console.log(model);
        model.getResource().setToken(token);
        window.open(model.resource.url.download, '_self');
      }).catch(function (error) {
        toastr.error('An error happened while preparing to download the file.');
      });
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

  }
})();
