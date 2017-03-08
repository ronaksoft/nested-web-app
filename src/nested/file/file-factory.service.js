(function() {
  'use strict';
  angular
    .module('ronak.nested.web.file')
    .service('NstSvcFileFactory', NstSvcFileFactory);

  /** @ngInject */
  function NstSvcFileFactory($q, _,
    NstSvcAuth, NstSvcServer, NST_CONFIG, NstSvcDownloadTokenStorage, NstSvcFileStorage, NstSvcFileTokenStorage,
    NstBaseFactory, NstPicture, NstAttachment, NstFactoryError, NstFactoryQuery, NstStoreToken,
    NST_FILE_TYPE) {

    function FileFactory() {
      NstBaseFactory.call(this);
    }

    FileFactory.prototype = new NstBaseFactory();
    FileFactory.prototype.constructor = FileFactory;

    FileFactory.prototype.get = get;
    FileFactory.prototype.parseFile = parseFile;
    FileFactory.prototype.getOne = getOne;
    FileFactory.prototype.getDownloadToken = getDownloadToken;

    var factory = new FileFactory();

    return factory;

    function get(placeId, filter, keyword, skip, limit) {
      return factory.sentinel.watch(function() {
        var deferred = $q.defer();

        NstSvcServer.request('place/get_files', {
          place_id: placeId,
          filter: filter || null,
          filename: keyword || '',
          skip: skip || 0,
          limit: limit || 16
        }).then(function(data) {
          var files = _.map(data.files, function (item) {
            var file = parseFile(item);
            NstSvcFileStorage.set(file.id, file);
            return file;
          });
          deferred.resolve(files);
        }).catch(function(error) {
          deferred.reject(error);
        });

        return deferred.promise;
      }, 'get', placeId);
    };

    function parseFile(data) {
      var file = new NstAttachment();
      file.setId(data._id);
      file.setFilename(data.filename);
      file.setSize(data.size);
      file.setMimetype(data.mimetype);
      file.setUploadTime(data.upload_time);
      file.setWidth(data.width);
      file.setHeight(data.height);

      if (data.thumbs && data.thumbs.pre) {
        file.setPicture(new NstPicture(data.thumbs));
      }

      return file;
    }

    function getOne(id) {
      return NstSvcFileStorage.get(id);
    }

    function createToken(rawToken) {
      var expTs = _.last(_.split(rawToken, "-"));
      if (!expTs) {
        expTs = Date.now() + Number(NST_CONFIG.STORE.TOKEN_EXPMS);
      }

      return new NstStoreToken(rawToken, new Date(Number(expTs)));
    }

    function getDownloadToken(attachmentId) {
      var defer = $q.defer();
      var tokenKey = generateTokenKey(attachmentId);

      var token = NstSvcDownloadTokenStorage.get(tokenKey);
      if (!token || token.isExpired()) { // then if the token exists then remove it and get a new token
        NstSvcDownloadTokenStorage.remove(tokenKey);
        requestNewDownloadToken(attachmentId).then(function (newToken) {
          NstSvcDownloadTokenStorage.set(tokenKey, newToken);
          defer.resolve(newToken);
        }).catch(defer.reject);
      } else { // current token is still valid and resolve it
        defer.resolve(token);
      }

      return defer.promise;
    }

    function requestNewDownloadToken(attachmentId) {
      var defer = $q.defer();

      NstSvcServer.request('file/get_download_token', {
        universal_id: attachmentId
      }).then(function(data) {
        var token = createToken(data.token);
        defer.resolve(token);
      }).catch(function(error) {
        var query = new NstFactoryQuery(attachmentId);
        var factoryError = new NstFactoryError(query, error.message, error.code);

        defer.reject(factoryError);
      });

      return defer.promise;
    }

    function generateTokenKey(universalId) {
      return universalId;
    }
  }
})();
