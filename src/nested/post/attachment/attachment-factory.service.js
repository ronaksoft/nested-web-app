(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcAttachmentFactory', NstSvcAttachmentFactory);

  /** @ngInject */
  function NstSvcAttachmentFactory($q, $log,
                                   _,
                                   NST_FILE_TYPE,
                                   NstSvcServer, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcFileType, NstSvcDownloadTokenStorage,
                                   NstAttachment, NstPicture, NstStoreResource, NstStoreToken, NstFactoryError, NstFactoryQuery) {

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


    function parseAttachment(data, post) {
      var defer = $q.defer(),
          attachment = createAttachmentModel();

      if (!data || !data._id) {
        defer.resolve(attachment);
      } else {
        attachment.setId(data._id);
        attachment.setPost(post);
        attachment.setResource(new NstStoreResource(data._id));
        attachment.setDownloads(data.downloads);
        attachment.setFilename(data.filename);
        attachment.setMimeType(data.mimetype);
        attachment.setSize(data.size);
        attachment.setStatus(data.status);
        attachment.setStoreId(data.store_id);
        attachment.setUploadTime(new Date(data.upload_time));

        var promises = [];

        // TODO: Use UploaderId instead
        if (data.uploader) {
          promises.push(NstSvcUserFactory.getTiny(data.uploader).catch(function (error) {

          }).then(function (user) {
            attachment.setUploader(user);
          }));
        }

        // TODO: Use OwnerIds instead
        if (data.owners) {
          for (var k in data.owners) {
            promises.push((function(index) {
              var deferred = $q.defer();
              var id = data.owners[index];

              // TODO: Put it to retry structure
              NstSvcPlaceFactory.getTiny(id).catch(function (error) {
                return $q(function (res) {
                  res(NstSvcPlaceFactory.parseTinyPlace({
                    _id: id
                  }));
                });
              }).then(function(tinyPlace) {
                attachment.addPlace(tinyPlace);

                deferred.resolve(tinyPlace);
              });

              return deferred.promise;
            })(k));
          }
        }

        if (data.thumbs) {
          var picture = new NstPicture(undefined, data.thumbs);
          if (NST_FILE_TYPE.IMAGE == NstSvcFileType.getType(attachment.getMimeType())) {
            picture.setId(attachment.getId());
          } else if (picture.getLargestThumbnail()) {
            picture.setId(picture.getLargestThumbnail().getId());
          }

          attachment.setPicture(picture);
        }

        $q.all(promises).then(function () {
          defer.resolve(attachment);
        });
      }

      return defer.promise;
    }

    function createToken(rawToken) {
      // TODO: Read expiration date from token itself
      return new NstStoreToken(rawToken, new Date(Date.now() + 3550000));
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

      NstSvcServer.request('store/get_download_token', {
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

    function load(id, post) {
      var defer = $q.defer();

      NstSvcServer.request('attachment/get_info', {
        attachment_id: id
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
