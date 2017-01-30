(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .controller('AttachmentViewController', AttachmentViewController);

  function AttachmentViewController($q, $timeout, $log, $uibModalInstance, $sce,
                                    hotkeys, toastr,
                                    NST_FILE_TYPE, NST_STORE_ROUTE,
                                    NstVmFileViewerItem,
                                    NstSvcLoader, NstSvcPostFactory, NstSvcAttachmentFactory, NstSvcPostMap, NstSvcAttachmentMap, NstSvcFileFactory, NstSvcStore, NstSvcTranslation,
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
    vm.download = download;
    vm.openInNewWindow = openInNewWindow;

    (function () {

      var selectedItemId = fileViewerItem ? fileViewerItem.id : fileId;
      if (_.isArray(fileViewerItems) && fileViewerItems.length > 0) {

        if (!_.some(fileViewerItems, {id: selectedItemId})) {

          loadFile(selectedItemId).then(function (file) {

            vm.attachments.collection = _.concat(mapToFileViewerItem(file), fileViewerItems);
            goTo(0)
          });

        } else {
          vm.attachments.collection = fileViewerItems;
          goTo(_.findIndex(vm.attachments.collection, {id: selectedItemId}));
        }

      } else if (_.isArray(fileIds) && fileIds.length > 0) {

        if (!_.some(fileIds, fileId)) {
          fileIds.unshift(fileId);
        }

        loadAllFiles(fileIds).then(function (files) {
          vm.attachments.collection = mapToFileViewerItems(files);
          goTo(_.findIndex(fileViewerItems, {id: selectedItemId}));
        });
      }
    })();

    hotkeys.add({
      combo: 'right',
      description: 'compose state',
      callback: function () {
        goNext();
      }
    });
    hotkeys.add({
      combo: 'left',
      description: 'compose state',
      callback: function () {
        goPrevious();
      }
    });

    function goNext() {
      var currentIndex = _.findIndex(vm.attachments.collection, {id: vm.attachments.current.id});
      var next = currentIndex + 1;
      if (vm.attachments.collection.length > 0 && next < vm.attachments.collection.length) {
        goTo(next);
      }
    }

    function goPrevious() {
      var currentIndex = _.findIndex(vm.attachments.collection, {id: vm.attachments.current.id});
      var previous = currentIndex - 1;
      if (vm.attachments.collection.length > 0 && previous >= 0) {
        goTo(previous);
      }
    }

    function goTo(index) {
      vm.attachments.current = vm.attachments.collection[index];
      if (vm.attachments.current.type === NST_FILE_TYPE.PDF ||
        vm.attachments.current.type === NST_FILE_TYPE.DOCUMENT) {
        //TODO::Create a directive
        $timeout(function () {
          vm.attachments.current.width = angular.element('.nst-preview-pic-mode').width() - 20;
          vm.attachments.current.height = angular.element('.nst-preview-pic-mode').height() - 20;
        },1000);
        getToken(vm.attachments.current.id).then(function (token) {
          vm.attachments.current.viewUrl = $sce.trustAsResourceUrl('//docs.google.com/viewer?embedded=true&url=' +
            encodeURI(NstSvcStore.resolveUrl(NST_STORE_ROUTE.DOWNLOAD, vm.attachments.current.id, token)));

        }).catch(function (error) {
          toastr.error('Sorry, An error has occured while trying to load the file');
        });
      }else if(vm.attachments.current.type === NST_FILE_TYPE.VIDEO || vm.attachments.current.type === NST_FILE_TYPE.AUDIO){
        getToken(vm.attachments.current.id).then(function (token) {
          var url = NstSvcStore.resolveUrl(NST_STORE_ROUTE.DOWNLOAD, vm.attachments.current.id, token);
          vm.attachments.current.viewUrl = $sce.trustAsResourceUrl(url);

          console.error(1111,url,vm.attachments.current)

        }).catch(function (error) {
          toastr.error('Sorry, An error has occured while trying to load the file');
        });
      }
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

    function loadAllFiles(ids) {
      var deferred = $q.defer();

      vm.filesLoadProgress = true;
      NstSvcFileFactory.get(ids).then(function (files) {
        deferred.resolve(files);
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get('Sorry, an error occurred in viewing the files.'));
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
        toastr.error(NstSvcTranslation.get('Sorry, an error occurred in viewing the files.'));
      }).finally(function () {
        vm.fileLoadProgress = false;
      });

      return deferred.promise;
    }

    function download(item) {
      if (item.downloadUrl) {
       location.href = item.downloadUrl;
       return;
      }

      getToken(item.id).then(function (token) {
        item.downloadUrl = $sce.trustAsResourceUrl(NstSvcStore.resolveUrl(NST_STORE_ROUTE.DOWNLOAD, item.id, token));
        item.viewUrl = NstSvcStore.resolveUrl(NST_STORE_ROUTE.VIEW, item.id, token);

        location.href = item.downloadUrl;
      }).catch(function (error) {
        toastr.error('Sorry, An error has occured while trying to load the file');
      });
    }

    function openInNewWindow(item) {
      if (item.viewUrl) {
        window.open(item.viewUrl, '_target');
        return;
      }

      getToken(item.id).then(function (token) {
        item.downloadUrl = NstSvcStore.resolveUrl(NST_STORE_ROUTE.DOWNLOAD, item.id, token);
        item.viewUrl = NstSvcStore.resolveUrl(NST_STORE_ROUTE.VIEW, item.id, token);

        window.open(item.viewUrl, '_target');
      }).catch(function (error) {
        toastr.error('Sorry, An error has occured while trying to load the file');
      });
    }
  }
})();
