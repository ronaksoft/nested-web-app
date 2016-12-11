(function() {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('NstSvcPostInteraction', NstSvcPostInteraction);

  /** @ngInject */
  function NstSvcPostInteraction($q, $uibModal, $rootScope,
    toastr,
    NstUtility, NstSvcModal, NstSvcPostFactory, NstSvcTranslation) {

    var RETRACT_CONFIRM_TITLE = NstSvcTranslation.get("Confirm"),
      RETRACT_CONFIRM_MESSAGE = NstSvcTranslation.get("Are you sure you want to retract this message? Once you do this, the message will be deleted from all recipient Places. This action cannot be undone."),
      RETRACT_SUCCESS_MESSAGE = NstSvcTranslation.get("The message has been retracted successfully."),
      RETRACT_FAILURE_MESSAGE = NstSvcTranslation.get("An error occured while retracting the message."),
      RETRACT_LATE_MESSAGE = NstSvcTranslation.get("Sorry, But it is too late to retract the message."),
      REMOVE_CONFIRM_TITLE = NstSvcTranslation.get("Confirm"),
      REMOVE_CONFIRM_MESSAGE = NstSvcTranslation.get("Are you sure you want to delete post {0} from Place {1}?"),
      REMOVE_CONFIRM_MESSAGE_NO_SUBJECT = NstSvcTranslation.get("Are you sure you want to delete the post from Place {0}?");

    var service = {
      remove: remove,
      retract: retract,
      markAsRead: markAsRead
    };

    return service;

    function remove(post, placesWithRemoveAccess) {
      if (placesWithRemoveAccess.length > 1) { //for multiple choices:
        return previewPlaces(placesWithRemoveAccess).then(function(place) {
          return deletePostFromPlace(post, place);
        });
      } else { // only one place
        return deletePostFromPlace(post, placesWithRemoveAccess[0]);
      }
    }

    /**
     * previewPlaces - preview the places that have delete access and let the user to choose one
     *
     * @param  {type} places list of places to be shown
     */
    function previewPlaces(places) {

      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/pages/places/list/place.list.modal.html',
        controller: 'placeListController',
        controllerAs: 'vm',
        keyboard: true,
        size: 'sm',
        resolve: {
          model: function() {
            return {
              places: places
            };
          }
        }
      });

      return modal.result;
    }

    /**
     * deletePostFromPlace - confirm and delete the post from the chosen place
     *
     * @param  {NstPost}   post    current post
     * @param  {NstPlace}  place   the chosen place
     * @return {Promise}              the result of deletion
     */
    function deletePostFromPlace(post, place) {
      var deferred = $q.defer();

      confirmOnDelete(post, place).then(function(yes) {
        if (yes) {
          NstSvcPostFactory.remove(post.id, place.id).then(function(res) {

            $rootScope.$broadcast('post-removed', {
              postId: post.id,
              placeId: place.id
            });

            deferred.resolve(place);
          }).catch(deferred.reject);
        } else {
          deferred.resolve(null);
        }
      }).catch(function() {
        deferred.resolve(null);
      });

      return deferred.promise;
    }

    function confirmOnDelete(post, place) {
      var deferred = $q.defer();

      var message = post.hasSubject ?
        NstUtility.string.format(REMOVE_CONFIRM_MESSAGE, post.subject, place.name) :
        NstUtility.string.format(REMOVE_CONFIRM_MESSAGE_NO_SUBJECT, place.name);

      NstSvcModal.confirm(REMOVE_CONFIRM_TITLE, message).then(function() {
        deferred.resolve(true);
      }).catch(function() {
        deferred.resolve(false);
      });

      return deferred.promise;
    }

    function retract(post) {
      var deferred = $q.defer();

      if (!post.wipeAccess) {
        toastr.info(RETRACT_LATE_MESSAGE);
        deferred.resolve(false);
      } else {
        NstSvcModal.confirm(RETRACT_CONFIRM_TITLE, RETRACT_CONFIRM_MESSAGE).then(function() {
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
        }).catch(function() {
          deferred.resolve(false);
        });
      }

      return deferred.promise;
    }

    function markAsRead(postId) {
      var deferred = $q.defer();

      NstSvcPostFactory.read([postId]).then(function(result) {
        $rootScope.$broadcast('post-read', {
          postId: postId,
        });

        deferred.resolve(true);
      }).catch(deferred.reject);

      return deferred.promise;
    }

  }

})();
