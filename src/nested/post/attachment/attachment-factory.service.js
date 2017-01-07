(function() {
  'use strict';
  angular
    .module('ronak.nested.web.file')
    .service('NstSvcAttachmentFactory', NstSvcAttachmentFactory);

  /** @ngInject */
  function NstSvcAttachmentFactory($q, $log,
                                   _,
                                   NstSvcServer, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcDownloadTokenStorage, NstSvcFileStorage,
                                   NstAttachment, NstPicture, NstStoreToken, NstFactoryError, NstFactoryQuery) {

    var uploadTokenKey = 'default-upload-token';

    /**
     * PostFactory - all operations related to post, comment
     */
    var service = {
      parseAttachment: parseAttachment,
      load: load,
      remove: remove,
      getDownloadUrl : getDownloadUrl,
      getDownloadToken: getDownloadToken,
      createAttachmentModel : createAttachmentModel
    };

    return service;


    function parseAttachment(data) {
      if (!data._id) {
        return $q.reject(new Error("Could not create a NstAttachment model without _id"));
      }

      if (!data.mimetype) {
        return $q.reject(new Error("Could not create a NstAttachment model without mimetype"));
      }

      if (!data.filename) {
        return $q.reject(new Error("Could not create a NstAttachment model without filename"));
      }

      var attachment = new NstAttachment();

      attachment.id = data._id;
      attachment.filename = data.filename;
      attachment.mimetype = data.mimetype;

      attachment.height = data.height || 0;
      attachment.width = data.width || 0;
      attachment.size = data.size || 0;

      if (data.thumbs) {
        attachment.picture = new NstPicture(data.thumbs);
      }

      NstSvcFileStorage.set(attachment.id, attachment);

      return attachment;
    }

    function createToken(rawToken) {
      var expTs = rawToken.split('-').pop();
      if (!expTs) {
        expTs = Date.now() + Number(NST_CONFIG.STORE.TOKEN_EXPMS);
      }

      return new NstStoreToken(rawToken, new Date(Number(expTs)));
    }

    function getDownloadToken(postId, attachmentId) {
      var defer = $q.defer();
      var tokenKey = generateTokenKey(postId, attachmentId);

      var token = NstSvcDownloadTokenStorage.get(tokenKey);
      if (!token || token.isExpired()) { // then if the token exists then remove it and get a new token
        NstSvcDownloadTokenStorage.remove(tokenKey);
        requestNewDownloadToken(postId, attachmentId).then(function (token) {
          NstSvcDownloadTokenStorage.set(tokenKey, token);
          defer.resolve(token);
        }).catch(defer.reject);
      } else { // current token is still valid and resolve it
        defer.resolve(token);
      }

      return defer.promise;
    }

    function requestNewDownloadToken(postId, attachmentId) {
      var defer = $q.defer();

      NstSvcServer.request('file/get_download_token', {
        post_id: postId,
        universal_id: attachmentId
      }).then(function(data) {
        var token = createToken(data.token);
        defer.resolve(token);
      }).catch(function(error) {
        var query = new NstFactoryQuery(attachmentId, { postId: postId });
        var factoryError = new NstFactoryError(query, error.message, error.code);

        defer.reject(factoryError);
      });

      return defer.promise;
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

    function generateTokenKey(postId, universalId) {
      return postId + '/' + universalId;
    }

    function createAttachmentModel() {
      return new NstAttachment();
    }

    /**
     * getDownloadUrl - Gets a download Url of the attachment in the following steps:
     *  1. Look for the token in the NstAttachment
     *  2. Check wether the token is expired or not, if it is expired continue the following steps
     *    a. Get a new token from server
     *    b. cache the new token
     *
     * @param  {type} attachment description
     * @return {type}            description
     */
    function getDownloadUrl(attachment) {
      if (!attachment.post.id) {
        throw 'Could not find the post which the attachment belongs to!'
      }

      var defer = $q.defer();

      if (!attachment.file.token) {
        $log.debug('Could not find a download token in the attachment :', attachment);
        $log.debug('A new token should be retrieved from server.');

        getDownloadToken(attachment.id, attachment.post.id).then(function (token) {
          attachment.token = token;
          defer.resolve(attachment.url.download);
        }).catch(defer.reject);

      } else {
        $log.debug('Found a download token in the attachment :', attachment);

        if (attachment.file.token.isExpired()) {
          $log.debug('The token is expired and a new token should be retrieved from server.');

          getDownloadToken(attachment.id, attachment.post.id).then(function (token) {
            attachment.token = token;
            defer.resolve(attachment.url.download);
          }).catch(defer.reject);

        } else {
          $log.debug('The token is still valid.');
          defer.resolve(attachment.url.download);
        }
      }

      return defer.promise;
    }
  }
})();
