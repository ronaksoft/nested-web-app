(function() {
  'use strict';
  angular
    .module('ronak.nested.web.file')
    .service('NstSvcAttachmentFactory', NstSvcAttachmentFactory);

  /** @ngInject */
  function NstSvcAttachmentFactory($q, $log, _,
                                   NstSvcServer, NstSvcDownloadTokenStorage, NstSvcFileStorage,
                                   NstAttachment, NstPicture, NstStoreToken, NstFactoryError, NstFactoryQuery) {

    /**
     * PostFactory - all operations related to post, comment
     */
    var service = {
      parseAttachment: parseAttachment,
      load: load,
      remove: remove,
      createAttachmentModel : createAttachmentModel,
      getOne : getOne
    };

    return service;


    function parseAttachment(data) {
      if (!data._id) {
        throw (new Error("Could not create a NstAttachment model without _id"));
      }

      if (!data.mimetype) {
        throw (new Error("Could not create a NstAttachment model without mimetype"));
      }

      if (!data.filename) {
        throw (new Error("Could not create a NstAttachment model without filename"));
      }

      var attachment = new NstAttachment();

      attachment.id = data._id;
      attachment.filename = data.filename;
      attachment.mimetype = data.mimetype;

      attachment.height = data.height || 0;
      attachment.width = data.width || 0;
      attachment.size = data.size || 0;

      if (data.thumbs && data.thumbs.pre) {
        attachment.picture = new NstPicture(data.thumbs);
      }

      NstSvcFileStorage.set(attachment.id, attachment);

      return attachment;
    }

    function load(ids) {
      var defer = $q.defer();

      NstSvcServer.request('file/get', {
        universal_ids: _.join(ids, ',')
      }).then(function(response) {
        var promises = _.map(response.info, parseAttachment);
        $q.all(promises).then(defer.resolve).catch(defer.reject);
      }).catch(function(error) {
        var query = new NstFactoryQuery(ids);
        defer.reject(new NstFactoryError(query, error.message, error.code));
      });

      return defer.promise;
    }

    function remove(attachmentId, postId) {
      var defer = $q.defer();

      NstSvcServer.request('attachment/remove', {
        post_id: postId,
        attachment_id: attachmentId
      }).then(function(response) {
        defer.resolve(attachmentId);
      }).catch(function(error) {
        var query = new NstFactoryQuery(attachmentId, { postId: postId });
        var factoryError = new NstFactoryError(query, error.message, error.code);

        defer.reject(factoryError);
      });

      return defer.promise;
    }

    function createAttachmentModel() {
      return new NstAttachment();
    }

    function getOne(id) {
      var deferred = $q.defer();

      NstSvcServer.request('file/get', {
        universal_id: id
      }).then(function(file) {
        deferred.resolve(parseAttachment(file));
      }).catch(function(error) {
        var query = new NstFactoryQuery(id);
        deferred.reject(new NstFactoryError(query, error.message, error.code));
      });

      return deferred.promise;
    }
  }
})();
