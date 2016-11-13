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
    // postId, vmAttachment, vmAttachments) {
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
          vm.attachments.current = _.find(fileViewerItems, { id : selectedItemId });

          goTo(vm.attachments.current);
        }

      } else if (_.isArray(fileIds) && fileIds.length > 0) {

        if (!_.some(fileIds, fileId)) {
          fileIds.unshift(fileId);
        }

        loadFiles(fileIds).then(function (files) {
          vm.attachments.collection = mapToFileViewerItems(files);
          vm.attachments.current = vm.attachments.current = _.find(fileViewerItems, { id : selectedItemId });

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

    /*****************************
     *** Controller Properties ***
     *****************************/



    // vm.post = undefined;
    // vm.postModel = undefined;


    /*****************************
     ***** Controller Methods ****
     *****************************/


    function goNext() {
      var currentKey = Number(_.findKey(vm.attachments.collection, { id: vm.attachments.current.id }));
      var nextKey = (currentKey + 1) % vm.attachments.collection.length;

      return goTo(vm.attachments.collection[nextKey]);
    };


    function goPrevious() {
      var currentKey = Number(_.findKey(vm.attachments.collection, { id: vm.attachments.current.id }));
      var nextKey = (vm.attachments.collection.length + currentKey - 1) % vm.attachments.collection.length;

      return goTo(vm.attachments.collection[nextKey]);
    };

    function goTo(file) {
      var deferred = $q.defer();

      var item = _.find(vm.attachments.collection, { id : file.id });

      if (!item) {
        deferred.reject();
      }

      if (item.id == vm.attachments.current.id) {
        deferred.resolve(vm.attachments.current);
      }

      vm.attachments.current = item;
      // Written in $timeout Just to update view
      $timeout(function () {
        if (vm.attachments.current.hasThumbnail) {
          if (!vm.attachments.current.isDownloaded) {
            vm.attachments.current.url = vm.attachments.current.thumbnail;
          }
        }
      });

      var promises = [
        loadToken(vm.attachments.current)
      ];

      // if (!vm.postModel && postId) {
      //   promises.push(loadPost());
      // }

      $q.all(promises).then(function (resolvedSet) {
        var token = resolvedSet[0];
        updateToken(token).then(function () {
          registerToken(token);
          deferred.resolve(vm.attachments.current);
        }).catch(deferred.reject());
      });

      return deferred.promise;
    };

    /*****************************
     *****  Controller Logic  ****
     *****************************/

    $uibModalInstance.result.catch(function () {
      return $q(function (res) {
        res(false);
      });
    }).then(function () {
      unregisterTokenUpdater();
    });

    /*****************************
     *****   Request Methods  ****
     *****************************/

    // function reqGetPost(id) {
    //   vm.status.postLoadProgress = true;
    //
    //   return NstSvcLoader.inject(NstSvcPostFactory.get(id)).then(function (post) {
    //     vm.status.postLoadProgress = false;
    //
    //     return $q(function (res) {
    //       res(post);
    //     });
    //   }).catch(function (error) {
    //     vm.status.postLoadProgress = false;
    //
    //     return $q(function (res, rej) {
    //       rej(error);
    //     });
    //   });
    // }

    function reqDownloadToken(id) {
      vm.status.tokenLoadProgress = true;

      return NstSvcLoader.inject(NstSvcFileFactory.getDownloadToken(id)).then(function (token) {
        vm.status.tokenLoadProgress = false;

        return $q(function (res) {
          res(token);
        });
      }).catch(function (error) {
        vm.status.tokenLoadProgress = false;

        return $q(function (res, rej) {
          rej(error);
        });
      });
    }

    /*****************************
     *****     Map Methods    ****
     *****************************/

    // function mapPost(postModel) {
    //   return NstSvcPostMap.toMessage(postModel);
    // }

    // function mapAttachment(attachmentModel) {
    //   return NstSvcAttachmentMap.toAttachmentItem(attachmentModel);
    // }

    function mapToFileViewerItem(file) {
      return new NstVmFileViewerItem(file);
    }

    function mapToFileViewerItems(files) {
      return _.map(files, mapToFileViewerItem);
    }


    /*****************************
     *****    Push Methods    ****
     *****************************/

    /*****************************
     *****  Event Listeners   ****
     *****************************/

    /*****************************
     *****   Other Methods    ****
     *****************************/

    function unregisterTokenUpdater() {
      if (vm.attachments.tokenUpdater) {
        $timeout.cancel(vm.attachments.tokenUpdater);
        vm.attachments.tokenUpdater = undefined;
      }
    }

    function registerToken(token) {
      unregisterTokenUpdater();

      vm.attachments.tokenUpdater = $timeout(function () {
        updateToken().then(function (attachment) {
          registerToken(attachment.getResource().getToken());
        });
      }, token.getExpiration().valueOf() - Date.now());
    }

    function updateToken(token) {
      var qToken = $q.defer();
      var deferred = $q.defer();

      if (token) {
        qToken.resolve(token);
      } else {
        loadToken(vm.attachments.current).then(qToken.resolve);
      }

      NstSvcLoader.inject(qToken.promise.then(function (token) {
        var deferred = $q.defer();
        var attachment = vm.postModel ? _.find(vm.postModel.attachments, { id: vm.attachments.current.id }) : vm.attachments.current;

        if (!attachment) {
          deferred.reject();
        } else {
          if (vm.attachments.downloader.request && vm.attachments.downloader.http) {
            vm.attachments.downloader.http.cancelDownload(vm.attachments.downloader.request);
          }

          attachment.downloadUrl = NstSvcStore.resolveUrl(NST_STORE_ROUTE.VIEW, attachment.id, token);
          deferred.resolve(attachment);
        }

        return deferred.promise;
      }).then(function (attachment) {
        var deferred = $q.defer();

        vm.attachments.downloader.http = new NstHttp(attachment.downloadUrl);
        vm.attachments.downloader.request = vm.attachments.downloader.http.downloadWithProgress(function (event) {
          if (event.lengthComputable) {
            vm.attachments.current.downloadedSize = event.loaded;
            vm.attachments.current.downloadedRatio = Number(event.loaded / event.total).toFixed(4);
          }
        });

        vm.attachments.downloader.request.finished().then(function () {
          vm.attachments.downloader.request = undefined;
          vm.attachments.downloader.http = undefined;
        });

        vm.attachments.downloader.request.getPromise().then(function (response) {
          var reader = new FileReader();
          var blob = new Blob([response.getData()], { type: attachment.mimeType });
          reader.onloadend = function(event) {
            var base64data = event.target.result;

            // Written in $timeout Just to update view
            $timeout(function () {
              // vm.attachments.current = mapAttachment(attachment);
              vm.attachments.current.downloadedSize = attachment.size;
              vm.attachments.current.downloadedRatio = 1;
              vm.attachments.current.isDownloaded = true;
              vm.attachments.current.url = base64data;

              if (NST_FILE_TYPE.IMAGE == vm.attachments.current.type) {
                EXIF.getData({ src: base64data }, function () {
                  if (this.exifdata || this.iptcdata) {
                    vm.attachments.current.meta.exif = this.exifdata || {};
                    vm.attachments.current.meta.iptc = this.iptcdata || {};

                    var key = _.findKey(vm.attachments.collection, { id: vm.attachments.current.id });
                    vm.attachments.collection[key] = vm.attachments.current;
                  }
                });
              }

              var key = _.findKey(vm.attachments.collection, { id: vm.attachments.current.id });
              vm.attachments.collection[key] = vm.attachments.current;
            });
          };
          reader.readAsDataURL(blob);

          deferred.resolve(attachment);
        }).catch(deferred.reject);

        return deferred.promise;
      }).then(deferred.resolve).catch(function (error) {
        $log.debug('Attachment View | Download Error: ', error);

        deferred.reject(error);
      }));

      return deferred.promise;
    }

    function loadToken(vmAttachment) {
      return reqDownloadToken(vmAttachment.id);
    }

    // function loadPost() {
    //   return reqGetPost(postId).then(function (post) {
    //     vm.postModel = post;
    //     vm.post = mapPost(vm.postModel);
    //   });
    // }

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
