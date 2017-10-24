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
    NstSvcServer, NstSvcFileType, NstSvcGlobalCache,
    NstBaseFactory, NstPicture, NstAttachment, NstStoreToken) {
    /**
     * @constructor
     */
    function FileFactory() {
      NstBaseFactory.call(this);

      this.tokenCache = NstSvcGlobalCache.createProvider('token');
      this.fileCache = NstSvcGlobalCache.createProvider('file');
    }

    FileFactory.prototype = new NstBaseFactory();
    FileFactory.prototype.constructor = FileFactory;

    FileFactory.prototype.setToken = function(key, value) {
      this.tokenCache.set(key, {
        value: value
      });
    };

    FileFactory.prototype.getToken = function(key) {
      var token = this.tokenCache.get(key);
      if (token && token.value) {
        return token.value;
      }

      return null;
    };

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
    FileFactory.prototype.getPlaceFiles = function (placeId, filter, keyword, skip, limit, cacheHandler) {
      var that = this;

      return NstSvcServer.request('place/get_files', {
        place_id: placeId,
        filter: filter || null,
        filename: keyword || '',
        skip: skip || 0,
        limit: limit || 16
      }, function (cachedResponse) {
        if (cachedResponse && _.isFunction(cacheHandler)) {
          var cachedFiles = _.map(cachedResponse.files, function (file) {
            return that.getCachedSync(file._id);
          });
          cacheHandler(_.compact(cachedFiles));
        }
      }).then(function (data) {
        return _.map(data.files, function (item) {
          that.setFile(item);
          return that.parseFile(item);
        });
      });

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

    FileFactory.prototype.recentFiles = function (skip, limit, cacheHandler) {
      var that = this;

      return NstSvcServer.request('file/get_recent_files', {
          skip: skip || 0,
          limit: limit || 16
      }, function (cachedResponse) {
        if (cachedResponse && _.isFunction(cacheHandler)) {
          var cachedFiles = _.map(cachedResponse.files, function (file) {
            return that.getCachedSync(file._id);
          });
          cacheHandler(_.compact(cachedFiles));
        }
      }).then(function (data) {
        var files = _.map(data.files, function (item) {
          var file = that.parseFile(item);
          that.setFile(item);
          return file;
        });

        return $q.resolve(files);
      });
    };

    FileFactory.prototype.setFile = function (data) {
      if (data && data._id) {
        this.fileCache.set(data._id, this.transformToCacheModel(data));
      }
    }


    /**
     * Get single file by Id
     *
     * @description return file from file storage
     *
     * @param id
     */
    FileFactory.prototype.getCachedSync = function (id) {
      return this.parseCachedModel(this.fileCache.get(id));
    }
    
    FileFactory.prototype.parseCachedModel = function (data) {
      if (!data) {
        return null;
      }

      return factory.parseFile(data);
    }

    FileFactory.prototype.transformToCacheModel = function (file) {
      return file;
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
    FileFactory.prototype.getDownloadToken = function (attachmentId, placeId, postId, taskId) {
      var deferred = $q.defer();
      var tokenKey = generateTokenKey(attachmentId);
      var tokenObj = createToken(factory.getToken(tokenKey));
      if (tokenObj && !tokenObj.isExpired()) {
        deferred.resolve(tokenObj);
      } else {
        factory.tokenCache.remove(tokenKey);
        requestNewDownloadToken(attachmentId, placeId, postId, taskId).then(function (newToken) {
          factory.setToken(tokenKey, newToken.toString());
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
    function requestNewDownloadToken(attachmentId, placeId, postId, taskId) {
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

      if (taskId) {
        requestData.task_id = taskId;
      }

      NstSvcServer.request('file/get_download_token', requestData).then(function (data) {
        defer.resolve(createToken(data.token));
      }).catch(defer.reject);

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
