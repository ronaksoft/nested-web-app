<<<<<<< HEAD
(function () {
=======
(function() {
>>>>>>> newlayout
  'use strict';
  angular
    .module('ronak.nested.web.file')
    .service('NstSvcFileFactory', NstSvcFileFactory);

  /** @ngInject */
  function NstSvcFileFactory($q, _,
    NstSvcAuth, NstSvcServer, NstSvcFileType, NstSvcDownloadTokenStorage, NstSvcFileStorage,
    NstBaseFactory, NstPicture, NstAttachment, NstFactoryError, NstFactoryQuery, NstStoreToken,
    NST_FILE_TYPE) {

    function FileFactory() {

    }

    FileFactory.prototype = new NstBaseFactory();
    FileFactory.prototype.constructor = FileFactory;

    FileFactory.prototype.get = get;
    FileFactory.prototype.parseFile = parseFile;
    FileFactory.prototype.getDownloadToken = getDownloadToken;
    FileFactory.prototype.getOne = getOne;

    var factory = new FileFactory();
    return factory;

    function get(placeId, filter, keyword, skip, limit) {

      return factory.sentinel.watch(function() {
        var deferred = $q.defer();

        NstSvcServer.request('store/get_files', {
          place_id: placeId,
          filter: filter || null,
          keyword: keyword || '',
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
      file.setMimeType(data.mimetype);

      if (data.thumbs) {
        var picture = new NstPicture(undefined, data.thumbs);
        if (NST_FILE_TYPE.IMAGE == NstSvcFileType.getType(file.getMimeType())) {
          picture.setId(file.getId());
        } else if (picture.getLargestThumbnail()) {
          picture.setId(picture.getLargestThumbnail().getId());
        }

        file.setPicture(picture);
      }

      return file;
    }

    function getDownloadToken(fileId) {

      var deferred = $q.defer();

      NstSvcServer.request('store/get_download_token', {
        universal_id: fileId
      }).then(function(data) {
        var token = createToken(data.token);

        deferred.resolve(token);
      }).catch(function(error) {
        var query = new NstFactoryQuery(fileId);
        var factoryError = new NstFactoryError(query, error.message, error.code);

        deferred.reject(factoryError);
      });

      return deferred.promise;
    }

    function createToken(rawToken) {
      var expTs = rawToken.split('-').pop();
      if (!expTs) {
        expTs = Date.now() + Number(NST_CONFIG.STORE.TOKEN_EXPMS);
      }

      return new NstStoreToken(rawToken, new Date(Number(expTs)));
    }

    function getOne(id) {
      return NstSvcFileStorage.get(id);
    }
  }
})();
