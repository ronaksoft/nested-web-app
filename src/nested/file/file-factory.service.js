(function () {
  'use strict';

  /**
   * @function NstSvcFileFactory
   * @memberOf ronak.nested.web.file
   * @description This service (factory) used for get files and manage download tokens.
   */
  angular
    .module('ronak.nested.web.file')
    .service('NstSvcFileFactory', NstSvcFileFactory);

  /** @ngInject */
  function NstSvcFileFactory($q, _,
                             NstSvcServer, NstSvcFileType, NstSvcDownloadTokenStorage, NstSvcFileStorage,
                             NstBaseFactory, NstPicture, NstAttachment, NstFactoryError, NstFactoryQuery, NstStoreToken) {
    /**
     * @constructor
     */
    function FileFactory() {
      NstBaseFactory.call(this);
    }

    FileFactory.prototype = new NstBaseFactory();
    FileFactory.prototype.constructor = FileFactory;


    /**
     * Get files list.
     * @public
     *
     * @param placeId
     * @param filter
     * @param keyword
     * @param skip
     * @param limit
     * @returns {*|promise} Array of NstAttachment objects
     */
    FileFactory.prototype.get = function (placeId, filter, keyword, skip, limit) {
      var that = this;
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('place/get_files', {
          place_id: placeId,
          filter: filter || null,
          filename: keyword || '',
          skip: skip || 0,
          limit: limit || 16
        }).then(function (data) {
          var files = _.map(data.files, function (item) {
            var file = that.parseFile(item);
            NstSvcFileStorage.set(file.id, file);
            return file;
          });
          deferred.resolve(files);
        }).catch(function (error) {
          deferred.reject(error);
        });

        return deferred.promise;
      }, 'get', placeId);
    }


    /**
     * Parse server file object
     * @public
     *
     * @param data
     *
     * @returns {NstAttachment}
     */
    FileFactory.prototype.parseFile = function (data) {
      var file = new NstAttachment();
      file.id = data._id;
      file.filename = data.filename;
      file.size = data.size;
      file.mimetype = data.mimetype;
      file.uploadTime = data.upload_time;
      file.uploadType = data.upload_type;
      file.width = data.width;
      file.height = data.height;
      file.type = NstSvcFileType.getType(data.mimetype);
      file.extension = NstSvcFileType.getSuffix(data.filename);

      if (data.thumbs && data.thumbs.pre) {
        file.picture = new NstPicture(data.thumbs);
        file.thumbnail = file.hasThumbnail("") ? file.picture.getUrl("x128") : '';
      }


      return file;
    }


    FileFactory.prototype.recentFiles = function (skip, limit) {
      var that = this;
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('file/get_recent_files', {
          skip: skip || 0,
          limit: limit || 16
        }).then(function (data) {
          var files = _.map(data.files, function (item) {
            var file = that.parseFile(item);
            NstSvcFileStorage.set(file.id, file);
            return file;
          });
          deferred.resolve(files);
        }).catch(function (error) {
          deferred.reject(error);
        });

        return deferred.promise;
      }, 'get');
    };


    /**
     * Get single file by Id
     *
     * @description return file from file storage
     *
     * @param id
     */
    FileFactory.prototype.getOne = function (id) {
      return NstSvcFileStorage.get(id);
    }


    /**
     * create an token object
     * @private
     *
     * @param {string} rawToken
     * @returns {NstStoreToken}
     */
    function createToken(rawToken) {
      return new NstStoreToken(rawToken, NstSvcServer.getSessionKey());
    }


    /**
     * Get download token from server for file(attachment)
     * @description try to get download token from server and store in NstTokenStorage
     *
     * @param attachmentId
     * @param placeId
     * @param postId
     * @returns {promise}
     */
    FileFactory.prototype.getDownloadToken = function (attachmentId, placeId, postId) {
      var deferred = $q.defer();
      var tokenKey = generateTokenKey(attachmentId);
      var tokenObj = NstSvcDownloadTokenStorage.get(tokenKey);
      if (tokenObj && !tokenObj.isExpired()) {
        deferred.resolve(tokenObj);
      } else {
        NstSvcDownloadTokenStorage.remove(tokenKey);
        requestNewDownloadToken(attachmentId, placeId, postId).then(function (newToken) {
          NstSvcDownloadTokenStorage.set(tokenKey, {
            token: newToken.toString(),
            sk: NstSvcServer.getSessionKey()
          });
          deferred.resolve(newToken);
        }).catch(deferred.reject);
      }

      return deferred.promise;
    }

    /**
     * Make server request to get download token
     * @private
     *
     * @param attachmentId
     * @param placeId
     * @param postId
     * @returns {promise}
     */
    function requestNewDownloadToken(attachmentId, placeId, postId) {
      var defer = $q.defer();

      var requestData = {
        universal_id: attachmentId
      };

      if (placeId) {
        requestData.place_id = placeId;
      }

      if (postId) {
        requestData.post_id = postId;
      }

      NstSvcServer.request('file/get_download_token', requestData).then(function (data) {
        defer.resolve(createToken(data.token));
      }).catch(function (error) {
        var query = new NstFactoryQuery(attachmentId);
        var factoryError = new NstFactoryError(query, error.message, error.code);

        defer.reject(factoryError);
      });

      return defer.promise;
    }

    /**
     * generate an string to identify token object
     * @private
     *
     * @param universalId
     * @returns {*}
     */
    function generateTokenKey(universalId) {
      return universalId;
    }

    var factory = new FileFactory();
    return factory;
  }
})();
