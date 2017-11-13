(function () {
  'use strict';
  angular
    .module('ronak.nested.web.file')
    .service('NstSvcAttachmentFactory', NstSvcAttachmentFactory);

  /** @ngInject */
  function NstSvcAttachmentFactory($q, _,
                                   NstSvcServer, NstSvcFileType,
                                   NstAttachment, NstPicture) {

    /**
     * PostFactory - all operations related to post, comment
     */
    var service = {
      parseAttachment: parseAttachment,
      createAttachmentModel: createAttachmentModel,
      getOne: getOne
    };

    return service;


    function parseAttachment(data) {
      try {
        if (!data._id) {
          throw (new Error("Could not create a NstAttachment model without _id"));
        }

        if (!data.mimetype) {
          throw (new Error("Could not create a NstAttachment model without mimetype"));
        }

        if (!data.filename) {
          throw (new Error("Could not create a NstAttachment model without filename"));
        }
      } catch (err) {
        return err;
      }

      var attachment = new NstAttachment();

      attachment.id = data._id;
      attachment.filename = data.filename;
      attachment.mimetype = data.mimetype;
      attachment.uploadTime = data.upload_time;
      attachment.uploadType = data.upload_type;
      attachment.meta = data.meta;
      if(attachment.meta && attachment.meta.duration) {
        attachment.meta.duration = attachment.meta.duration / 1000000
      }

      attachment.height = data.height || 0;
      attachment.width = data.width || 0;
      attachment.size = data.size || 0;

      attachment.type = NstSvcFileType.getType(data.mimetype);
      attachment.extension = NstSvcFileType.getSuffix(data.filename);

      if (data.thumbs && data.thumbs.pre) {
        attachment.picture = new NstPicture(data.thumbs);
        attachment.thumbnail = attachment.hasThumbnail("") ? attachment.picture.getUrl("x128") : '';
      }

      return attachment;
    }


    function createAttachmentModel() {
      return new NstAttachment();
    }

    function getOne(id) {
      var deferred = $q.defer();

      NstSvcServer.request('file/get', {
        universal_id: id
      }).then(function (file) {
        deferred.resolve(parseAttachment(file));
      }).catch(deferred.reject);

      return deferred.promise;
    }
  }
})();
