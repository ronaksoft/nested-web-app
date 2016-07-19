(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcAttachmentFactory', NstSvcAttachmentFactory);

  /** @ngInject */
  function NstSvcAttachmentFactory($q, $log,
    _,
    NstSvcServer, NstSvcStore, NstSvcPlaceFactory, NstSvcUserFactory,
    NstAttachment, NstStoreResource, NstFactoryError, NstFactoryQuery) {

    var uploadTokenKey = 'default-upload-token';

    /**
     * PostFactory - all operations related to post, comment
     */
    var service = {
      parseAttachment: parseAttachment,
      load: load,
      remove: remove,
      getDownloadUrl : getDownloadUrl,
      createAttachmentModel : createAttachmentModel
    };

    return service;


    function parseAttachment(data, post) {
      var defer = $q.defer(),
          attachment = createAttachmentModel();

      if (!data || !data._id) {
        defer.resolve(attachment);
      } else {
        attachment.post = post;
        attachment.id = data._id;
        attachment.file = new NstStoreResource(data.download);
        attachment.downloads = data.downloads;
        attachment.fileName = data.filename;
        attachment.mimeType = data.mimetype;
        attachment.size = data.size;
        attachment.status = data.status;
        attachment.storeId = data.store_id;
        attachment.uploadTime = new Date(data.upload_time);
        attachment.ownerIds = data.owners;
        attachment.uploaderId = data.uploader;
        // TODO: Replace thumbs with NstPicture
        if (data.thumbs) {
          attachment.thumbs = {
            x32: new NstStoreResource(data.thumbs.x32),
            x64: new NstStoreResource(data.thumbs.x64),
            x128: new NstStoreResource(data.thumbs.x128)
          };
        }

        defer.resolve(attachment);
      }

      return defer.promise;
    }

    function createToken(rawToken) {
      // TODO: Read expiration date from token itself
      return new NstStoreToken(rawToken, new Date(Date.now() + 3600));
    }

    function getDownloadToken(postId, attachmentId) {
      var defer = $q.defer();
      var tokenKey = generateTokenKey(postId, attachmentId)

      var token = NstSvcDownloadTokenStorage.get(tokenKey);
      if (!token || token.isExpired()) { // then if the token exists then remove it and get a new token

        NstSvcDownloadTokenStorage.remove(tokenKey);
        requestNewDownloadToken(postId, attachmentId).then(defer.resolve).catch(defer.reject);

      } else { // current token is still valid and resolve it
        defer.resolve(token);
      }

      return defer.promise;
    }

    function requestNewDownloadToken(postId, attachmentId) {
      var defer = $q.defer();

      NstSvcServer.request('store/get_download_token', {
        post_id: postId,
        universal_id: universalId
      }).then(function(data) {
        // TODO: Read expiration date from token itself
        var token = new NstStoreToken(data.token, new Date(Date.now() + 3600));
        NstSvcDownloadTokenStorage.set(tokenKey, token);
        defer.resolve(token);
      }).catch(function(error) {
        var query = new NstFactoryQuery(attachmentId, {
          postId: postId,
        });
        var factoryError = new NstFactoryError(query, error.message, error.code);
      });

      return defer.promise;
    }

    function load(id, post) {
      var defer = $q.defer;

      NstSvcServer.request('attachment/get_info', {
        attachment_id: this.id
      }).then(function(response) {
        parseAttachment(response.attachment, post).then(defer.resolve).reject(defer.reject);
      }).catch(function(error) {
        var query = new NstFactoryQuery(id);
        defer.reject(new NstFactoryError(query, error.message, error.code));
      });

      return defer.promise;
    }

    function remove(attachmentId, postId) {
      var defer = $q.defer();

      return NstSvcServer.request('attachment/remove', {
        post_id: postId,
        attachment_id: attachmentId
      }).then(function(response) {

        resolve(attachmentId);
      }).catch(function(error) {

        var query = new NstFactoryQuery(attachmentId, {
          postId: postId,
        });
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
