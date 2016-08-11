(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcFileType', NstSvcFileType);

  /** @ngInject */
  function NstSvcFileType(NST_FILE_TYPE) {
    var fileGroups = {};

    fileGroups[NST_FILE_TYPE.ARCHIVE] = [
      'application/zip',
      'application/x-rar-compressed',
    ];

    fileGroups[NST_FILE_TYPE.DOCUMENT] = [
      'text/plain',
      'application/msword',
      'application/vnd.ms-excel'
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
      'audio/ogg'
    ];
    fileGroups[NST_FILE_TYPE.VIDEO] = [
      'video/mp4',
      'video/3gp',
      'video/ogg',
      'video/webm',
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

    function getType(mimeType) {
      if (!mimeType) {
        return '';
      }

      var type = _.findKey(fileGroups, function(mimeTypeList) {
        return _.includes(mimeTypeList, mimeType);
      });

      return type || NST_FILE_TYPE.OTHER;
    }

    function getSuffix(fileName) {
      if (!fileName) {
        return '';
      }

      return fileName.substr(_.lastIndexOf(fileName, '.'));
    }

    function removeSuffix(fileName) {
      if (!fileName) {
        return '';
      }

      return fileName.substr(0, _.lastIndexOf(fileName, '.'));
    }
  }
})();
