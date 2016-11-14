(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .controller('AttachmentViewController', AttachmentViewController);

  function AttachmentViewController($q, $timeout, $log, $uibModalInstance,
    hotkeys, toastr,
    NST_FILE_TYPE, NST_STORE_ROUTE,
    NstSvcLoader, NstSvcPostFactory, NstSvcAttachmentFactory, NstSvcPostMap, NstSvcAttachmentMap, NstSvcFileFactory, NstSvcStore,
    NstHttp,
    fileId, fileViewerItem, fileIds, fileViewerItems) {
    var vm = this;

    vm.attachments = {
      collection: [],
      current: null,
      tokenUpdater: undefined,
      downloader: {
        http: undefined,
        request: undefined
      }
    };
    vm.status = {
      postLoadProgress: false,
      tokenLoadProgress: false,
      attachmentLoadProgress: false
    };

    vm.goNext = goNext;
    vm.goPrevious = goPrevious;
    vm.goTo = goTo;

    (function () {

      var selectedItemId = fileViewerItem ? fileViewerItem.id : fileId;
      if (_.isArray(fileViewerItems) && fileViewerItems.length > 0) {

        if (!_.some(fileViewerItems, { id : selectedItemId })) {

          loadFile(selectedItemId).then(function (file) {

            vm.attachments.collection = _.concat(mapToFileViewerItem(file), fileViewerItems);
            vm.attachments.current = vm.attachments.collection[0];

            goTo(vm.attachments.current);
          });

        } else {

          vm.attachments.collection = fileViewerItems;
          vm.attachments.current = _.find(fileViewerItems, { id : selectedItemId }) || fileViewerItem;

          goTo(vm.attachments.current);
        }

      } else if (_.isArray(fileIds) && fileIds.length > 0) {

        if (!_.some(fileIds, fileId)) {
          fileIds.unshift(fileId);
        }

        loadFiles(fileIds).then(function (files) {
          vm.attachments.collection = mapToFileViewerItems(files);
          vm.attachments.current = _.find(fileViewerItems, { id : selectedItemId }) || fileViewerItem;

          goTo(vm.attachments.current);
        });
      }
    })();

    hotkeys.add({
      combo: 'right',
      description: 'compose state',
      callback: function() {
        goNext();
      }
    });
    hotkeys.add({
      combo: 'left',
      description: 'compose state',
      callback: function() {
        goPrevious();
      }
    });

    function goNext() {
      var currentKey = Number(_.findKey(vm.attachments.collection, { id: vm.attachments.current.id }));
      var nextKey = (currentKey + 1) % vm.attachments.collection.length;

      goTo(vm.attachments.collection[nextKey]).then(function (item) {
        vm.attachments.current = item;
      }).catch(function (error) {
        toastr.error('Sorry, an error happened while retrieving the next file.');
      });
    };

    function goPrevious() {
      var currentId = vm.attachments.current.id;
      vm.attachments.current = { downloadUrl : '' };
      $timeout(function () {
        var currentKey = Number(_.findKey(vm.attachments.collection, { id: currentId }));
        var nextKey = (vm.attachments.collection.length + currentKey - 1) % vm.attachments.collection.length;

        goTo(vm.attachments.collection[nextKey]).then(function (item) {
          vm.attachments.current = item;
        }).catch(function (error) {
          toastr.error('Sorry, an error happened while retrieving the previous file.');
        });
      });
    };

    function goTo(file) {
      var deferred = $q.defer();

      var item = _.find(vm.attachments.collection, { id : file.id });

      if (!item) {
        deferred.resolve(vm.attachments.current);
      } else {

        vm.attachments.current = item;

        getToken(file.id).then(function (token) {
          $timeout(function () {
            vm.attachments.current.downloadUrl = NstSvcStore.resolveUrl(NST_STORE_ROUTE.VIEW, file.id, token);
          });
          deferred.resolve(item);
        }).catch(deferred.reject);
      }

      return deferred.promise;
    };

    function getToken(id) {
      var deferred = $q.defer();
      vm.status.tokenLoadProgress = true;

      NstSvcFileFactory.getDownloadToken(id).then(deferred.resolve).catch(deferred.reject).finally(function () {
        vm.status.tokenLoadProgress = false;
      });

      return deferred.promise;
    }

    function mapToFileViewerItem(file) {
      return new NstVmFileViewerItem(file);
    }

    function mapToFileViewerItems(files) {
      return _.map(files, mapToFileViewerItem);
    }

    function loadFiles(ids) {
      var deferred = $q.defer();

      vm.filesLoadProgress = true;
      NstSvcFileFactory.get(ids).then(function (files) {
        deferred.resolve(files);
      }).catch(function (error) {
        toastr.error('Sorry, an error happened while preparing to view the files.');
      }).finally(function () {
        vm.filesLoadProgress = false;
      });

      return deferred.promise;
    }

    function loadFile(id) {
      var deferred = $q.defer();

      vm.fileLoadProgress = true;
      NstSvcFileFactory.get([id]).then(function (files) {
        deferred.resolve(files[0]);
      }).catch(function (error) {
        toastr.error('Sorry, an error happened while preparing to view the files.');
      }).finally(function () {
        vm.fileLoadProgress = false;
      });

      return deferred.promise;
    }
  }
})();
