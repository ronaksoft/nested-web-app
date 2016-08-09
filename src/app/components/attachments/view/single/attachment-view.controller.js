(function() {
  'use strict';

  angular
    .module('nested')
    .controller('AttachmentViewController', AttachmentViewController);

  function AttachmentViewController($q, $timeout, $log,
                                    hotkeys,
                                    NstSvcLoader, NstSvcTry, NstSvcPostFactory, NstSvcAttachmentFactory, NstSvcPostMap, NstSvcAttachmentMap,
                                    NstHttp,
                                    postId, vmAttachment, vmAttachments) {
    var vm = this;

    hotkeys.add({
      combo: 'right',
      description: 'compose state',
      callback: function() {
        vm.goNext();
      }
    });
    hotkeys.add({
      combo: 'left',
      description: 'compose state',
      callback: function() {
        vm.goPrevious();
      }
    });

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.status = {
      postLoadProgress: false,
      tokenLoadProgress: false,
      attachmentLoadProgress: false
    };

    vm.post = undefined;
    vm.postModel = undefined;

    vm.attachments = {
      collection: vmAttachments,
      current: vmAttachment,
      tokenUpdater: undefined,
      downloader: {
        http: undefined,
        request: undefined
      }
    };

    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.goNext = function () {
      var currentKey = Number(_.findKey(vm.attachments.collection, { id: vm.attachments.current.id }));
      var nextKey = (currentKey + 1) % vm.attachments.collection.length;

      return vm.goTo(vm.attachments.collection[nextKey]);
    };

    vm.goPrevious = function () {
      var currentKey = Number(_.findKey(vm.attachments.collection, { id: vm.attachments.current.id }));
      var nextKey = (vm.attachments.collection.length + currentKey - 1) % vm.attachments.collection.length;

      return vm.goTo(vm.attachments.collection[nextKey]);
    };

    vm.goTo = function (vmAttachment) {
      var deferred = $q.defer();
      vmAttachment = _.find(vm.attachments.collection, { id: vmAttachment.id });

      if (!vmAttachment) {
        deferred.reject();
      }

      if (vmAttachment.id == vm.attachments.current.id) {
        deferred.resolve(vm.attachments.current);
      }

      vm.attachments.current = vmAttachment;
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

      if (!vm.postModel) {
        promises.push(loadPost());
      }

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

    vm.goTo(vm.attachments.current);

    /*****************************
     *****   Request Methods  ****
     *****************************/

    function reqGetPost(id) {
      vm.status.postLoadProgress = true;

      return NstSvcLoader.inject(NstSvcTry.do(function () {
        return NstSvcPostFactory.get(id);
      })).then(function (post) {
        vm.status.postLoadProgress = false;

        return $q(function (res) {
          res(post);
        });
      }).catch(function (error) {
        vm.status.postLoadProgress = false;

        return $q(function (res, rej) {
          rej(error);
        });
      });
    }

    function reqDownloadToken(id, postId) {
      vm.status.tokenLoadProgress = true;

      return NstSvcLoader.inject(NstSvcTry.do(function () {
        return NstSvcAttachmentFactory.getDownloadToken(postId, id);
      })).then(function (token) {
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

    function mapPost(postModel) {
      return NstSvcPostMap.toMessage(postModel);
    }

    function mapAttachment(attachmentModel) {
      return NstSvcAttachmentMap.toAttachmentItem(attachmentModel);
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

    function registerToken(token) {
      if (vm.attachments.tokenUpdater) {
        $timeout.cancel(vm.attachments.tokenUpdater);
        vm.attachments.tokenUpdater = undefined;
      }

      // FIXME: Cancel updater on modal exit
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
        var attachment = _.find(vm.postModel.attachments, { id: vm.attachments.current.id });

        if (!attachment) {
          deferred.reject();
        } else {
          if (vm.attachments.downloader.request && vm.attachments.downloader.http) {
            vm.attachments.downloader.http.cancelDownload(vm.attachments.downloader.request);
          }

          attachment.getResource().setToken(token);
          $timeout(function () {
            vm.attachments.current.urls.view = attachment.getResource().getUrl().view;
            vm.attachments.current.urls.download = attachment.getResource().getUrl().download;
            vm.attachments.current.urls.stream = attachment.getResource().getUrl().stream;
          });
          deferred.resolve(attachment);
        }

        return deferred.promise;
      }).then(function (attachment) {
        var deferred = $q.defer();

        vm.attachments.downloader.http = new NstHttp(attachment.getResource().getUrl().view + '/' + attachment.getFilename());
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
          var blob = new Blob([response.getData()], { type: attachment.getMimeType() });
          reader.onloadend = function(event) {
            var base64data = event.target.result;
            // Written in $timeout Just to update view
            $timeout(function () {
              // vm.attachments.current = mapAttachment(attachment);
              vm.attachments.current.isDownloaded = true;
              vm.attachments.current.url = base64data;

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
      return reqDownloadToken(vmAttachment.id, postId);
    }

    function loadPost() {
      return reqGetPost(postId).then(function (post) {
        vm.postModel = post;
        vm.post = mapPost(vm.postModel);
      });
    }
  }
})();
