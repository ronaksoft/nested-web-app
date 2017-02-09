(function() {
  angular
    .module('ronak.nested.web.components.text')
    .filter('link', ['$state','$sanitize', function($state,$sanitize) {

      var LINKY_URL_REGEXP =
          /((ftps?|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"\u201d\u2019]/i,
        MAILTO_REGEXP = /^mailto:/i;

      var linkyMinErr = angular.$$minErr('linky');
      var isDefined = angular.isDefined;
      var isFunction = angular.isFunction;
      var isObject = angular.isObject;
      var isString = angular.isString;

      return function(text, target, attributes) {
        if (text == null || text === '') return text;
        if (!isString(text)) throw linkyMinErr('notstring', 'Expected string but received: {0}', text);

        var attributesFn =
          isFunction(attributes) ? attributes :
            isObject(attributes) ? function getAttributesObject() {return attributes;} :
              function getEmptyAttributesObject() {return {};};

        var match;
        var raw = text;
        var html = [];
        var url;
        var i;
        while ((match = raw.match(LINKY_URL_REGEXP))) {
          // We can not end in these as they are sometimes found at the end of the sentence
          url = match[0];
          // if we did not match ftp/http/www/mailto then assume mailto
          if (!match[2] && !match[4]) {
            url = ( match[3] ? 'http://' : 'mailto:') + url;
          }
          i = match.index;
          addText(raw.substr(0, i));
          addLink(url, match[0].replace(MAILTO_REGEXP, ''));
          raw = raw.substring(i + match[0].length);
        }
        addText(raw);
        return $sanitize(html.join(''));

        function addText(text) {
          if (!text) {
            return;
          }
          html.push(text);
        }

        function addLink(url, text) {
          var key, linkAttributes = attributesFn(url);
          html.push('<a ');

          for (key in linkAttributes) {
            html.push(key + '="' + linkAttributes[key] + '" ');
          }


          html.push('target="_blank"');

          html.push('href="',
            url.replace(/"/g, '&quot;'),
            '">');
          addText(text);
          html.push('</a>');
        }
      };
    }]);
})();
