(function() {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('NstSvcPostInteraction', NstSvcPostInteraction);

  /** @ngInject */
  function NstSvcPostInteraction($q, $uibModal, $rootScope,
    toastr, NST_POST_EVENT,
    NstUtility, NstSvcModal, NstSvcPostFactory, NstSvcTranslation) {

    var RETRACT_CONFIRM_TITLE = NstSvcTranslation.get("Confirm"),
      RETRACT_CONFIRM_MESSAGE = NstSvcTranslation.get("Are you sure you want to retract this message? This action will delete the message from all the recipients and cannot be undone."),
      RETRACT_SUCCESS_MESSAGE = NstSvcTranslation.get("The message has been retracted successfully."),
      RETRACT_FAILURE_MESSAGE = NstSvcTranslation.get("An error has occurred in the retraction of the message."),
      RETRACT_LATE_MESSAGE = NstSvcTranslation.get("Sorry, but your 24-hour retraction time has come to its end.");

    var service = {
      retract: retract,
      markAsRead: markAsRead
    };

    return service;

    function retract(post) {
      var deferred = $q.defer();

      if (!post.wipeAccess) {
        toastr.info(RETRACT_LATE_MESSAGE);
        deferred.resolve(false);
      } else {
        NstSvcModal.confirm(RETRACT_CONFIRM_TITLE, RETRACT_CONFIRM_MESSAGE).then(function(confirmed) {
          if (confirmed) {
            NstSvcPostFactory.retract(post.id).then(function(result) {
              $rootScope.$broadcast('post-removed', {
                postId: post.id,
              });
              toastr.success(RETRACT_SUCCESS_MESSAGE);
              deferred.resolve(true);
            }).catch(function(error) {
              toastr.error(RETRACT_FAILURE_MESSAGE);
              deferred.reject(error);
            });
          }
        }).catch(function() {
          deferred.resolve(false);
        });
      }

      return deferred.promise;
    }

    function markAsRead(postId) {
      var deferred = $q.defer();

      NstSvcPostFactory.read(postId).then(function(result) {
        $rootScope.$broadcast(NST_POST_EVENT.READ, {
          postId: postId,
        });

        deferred.resolve(true);
      }).catch(deferred.reject);

      return deferred.promise;
    }

  }

})();
