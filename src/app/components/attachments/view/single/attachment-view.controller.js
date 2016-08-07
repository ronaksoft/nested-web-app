(function() {
  'use strict';

  angular
    .module('nested')
    .controller('AttachmentViewController', AttachmentViewController);

  function AttachmentViewController($q, $timeout,
                                    NstSvcLoader, NstSvcTry, NstSvcPostFactory, NstSvcAttachmentFactory, NstSvcPostMap, NstSvcAttachmentMap,
                                    postId, vmAttachment, vmAttachments) {
    var vm = this;

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
      tokenUpdater: undefined
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
      if (vm.attachments.current.hasThumbnail) {
        // Written in $timeout Just to update view
        $timeout(function () {
          vm.attachments.current.url = vm.attachments.current.thumbnail;
        });
      }

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
        }

        attachment.getResource().setToken(token);
        $timeout(function () {
          // TODO: Do not show until new url is fully loaded
          vm.attachments.current = mapAttachment(attachment);
        });
        deferred.resolve(attachment);

        return deferred.promise;
      })).then(deferred.resolve);

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
