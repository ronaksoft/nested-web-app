(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcPostMap', NstSvcPostMap);

  /** @ngInject */
  function NstSvcPostMap(NstSvcCommentMap) {

    var service = {
      toMessage: toMessage
    };

    return service;

    /*********************
     *  Implementations  *
     *********************/

    function toMessage(post) {
      var now = moment();

      var firstPlace = _.first(post.places);

      return {
        id: post.id,
        sender: mapSender(post.sender),
        subject: post.subject,
        body: post.body,
        contentType: post.contentType,
        firstPlace: mapPlace(firstPlace),
        allPlaces: _.map(post.places, mapPlace),
        otherPlacesCount: post.places.length - 1,
        allPlacesCount: post.places.length,
        date: formatMessageDate(post.date),
        attachments: _.map(post.attachments, mapAttachment),
        hasAnyAttachment: post.attachments.length > 0,
        comments: _.map(post.comments, mapComment),
        hasAnyComment: post.comments.length > 0,
        commentsCount: post.counters.comments > -1 ? post.counters.comments : 0,
        isReplyed : !!post.replyTo,
        isForwarded : !!post.forwardFrom
        // userHasRemoveAccess : post.haveAnyPlaceWithDeleteAccess()
      };

      function mapSender(sender) {
        if (!sender) {
          return {};
        }
        return {
          name: sender.fullName,
          username: sender.id,
          avatar: sender.picture.getThumbnail('32').url.download
        };
      }

      function mapAttachment(attach) {
        return {
          fileName: attach.fileName,
          size: attach.size,
          url: attach.file.url,
          type: findFileType(attach),
          format: findFileFormat(attach),
          thumbnail: attach.thumbnail.getThumbnail('128').url.download
        };

        function findFileType(attach) {
          var fileTypes = {
            'image': 'Image',
            'audio': 'Audio',
            'video': 'Video',
            'text': 'Text',
            'application': 'Application'
          };

          var type = attach.mimeType.split('/')[0];

          return fileTypes[type] || 'Unknown';
        }

        function findFileFormat(attach) {
          var fileFormats = {
            'zip': 'ZIP',
            'x-rar-compressed': 'RAR',
            'rtf': 'DOC',
            'msword': 'DOCX',
            'vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOC'
          };
          
          var format = attach.mimeType.split('/')[1];

          return fileFormats[format] || 'File';
        }
      }

      function mapPlace(place) {
        return {
          id: place.id,
          name: place.name,
          picture: place.picture.getThumbnail('64').url.download
        };
      }

      function formatMessageDate(date) {
        if (!date) {
          return 'Unknown';
        }

        if (!moment.isMoment(date)) {
          date = moment(date);
        }

        var today = moment().startOf('day');
        if (date.isSameOrAfter(today)) { // today
          return date.format('[Today at] HH:mm');
        }

        var yesterday = moment().startOf('day').subtract(1, 'days');
        if (date.isSameOrAfter(yesterday)) { // yesterday
          return date.format('[Yesterday at] HH:mm');
        }

        var year = moment().startOf('year');
        if (date.isSameOrAfter(year)) { // current year
          return date.format('MMM DD, HH:mm');
        }

        return date.format("MMM DD YYYY, HH:mm"); // last year and older
      }



      function mapComment(comment) {
        return NstSvcCommentMap.toMessageComment(comment);
      }

    }
  }

})();
