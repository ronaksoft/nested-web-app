(function() {
  'use strict';
  angular
    .module('ronak.nested.web.file')
    .service('NstSvcFileType', NstSvcFileType);

  /** @ngInject */
  function NstSvcFileType(NST_FILE_TYPE) {
    var fileGroups = {};

    fileGroups[NST_FILE_TYPE.ARCHIVE] = [
      'application/zip',
      'application/x-rar-compressed'
    ];

    fileGroups[NST_FILE_TYPE.DOCUMENT] = [
      'text/plain',
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
    ];

    fileGroups[NST_FILE_TYPE.IMAGE] = [
      'image/bmp',
      'image/jpeg',
      'image/gif',
      'image/ief',
      'image/png',
      'image/vnd.dwg',
      'image/svg+xml'
    ];

    fileGroups[NST_FILE_TYPE.AUDIO] = [
      'audio/mpeg',
      'audio/aac',
      'audio/mp4',
      'audio/wma',
      'audio/wav',
      'audio/webm',
      'audio/ogg'
    ];
    fileGroups[NST_FILE_TYPE.VIDEO] = [
      'video/mp4',
      'video/3gp',
      'video/ogg',
      'application/octet-stream',
      'video/quicktime',
      'video/webm'
    ];

    fileGroups[NST_FILE_TYPE.PDF] = [
      'application/pdf'
    ];

    var service = {
      getType: getType,
      getSuffix: getSuffix,
      removeSuffix: removeSuffix
    };

    return service;

    function getType(mimetype) {
      if (!mimetype) {
        return '';
      }

      var type = _.findKey(fileGroups, function(mimetypeList) {
        return _.includes(mimetypeList, mimetype);
      });

      return type || NST_FILE_TYPE.OTHER;
    }

    function getSuffix(fileName) {
      if (!fileName) {
        return '';
      }

      var index = _.lastIndexOf(fileName, '.');

      if (index === -1) {
        return '';
      }

      return fileName.substr(index + 1);
    }

    function removeSuffix(fileName) {
      if (!fileName) {
        return '';
      }

      var index = _.lastIndexOf(fileName, '.');

      if (index === -1) {
        return fileName;
      }

      return fileName.substr(0, index);
    }
  }
})();
