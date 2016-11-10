(function () {
  'use strict';
  angular
    .module('ronak.nested.web.file')
    .service('NstSvcFileFactory', NstSvcFileFactory);

  /** @ngInject */
  function NstSvcFileFactory($q, _,
    NstSvcAuth, NstSvcServer, NstSvcFileType,
    NstBaseFactory, NstPicture, NstAttachment, NstFactoryError, NstFactoryQuery,
    NST_FILE_TYPE) {

    function FileFactory() {

    }

    FileFactory.prototype = new NstBaseFactory();
    FileFactory.prototype.constructor = FileFactory;

    FileFactory.prototype.get = get;
    FileFactory.prototype.parseFile = parseFile;
    FileFactory.prototype.getDownloadToken = getDownloadToken;


    var factory = new FileFactory();
    return factory;

    function get(placeId, filter, keyword, skip, limit) {
      return factory.sentinel.watch(function () {
        var deferred = $q.defer();

        NstSvcServer.request('store/get_files', {
          place_id : placeId,
          filter : filter || null,
          keyword : keyword || '',
          skip : skip || 0,
          limit : limit || 16
        }).then(function (data) {
          deferred.resolve(_.map(data.files, parseFile));
        }).catch(function (error) {
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

    }



  }
})();
