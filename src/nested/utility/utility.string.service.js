(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.utility')
    .service('NstUtilString', NstUtilString);

  /** @ngInject */
  function NstUtilString(_) {
    function StringUtility() {

    }

    StringUtility.prototype = {};
    StringUtility.prototype.constructor = StringUtility;

    StringUtility.prototype.format = function (text) {
      var parameters = _.drop(Array.from(arguments));

      if (parameters.length === 0) {
        return text;
      }

      if (_.isArray(parameters[0])){
        text = replaceAllParameters(text, parameters[0]);
      } else {
        text = replaceAllParameters(text, parameters);
      }

      return text;
    };

    function replaceByIndex(text, index, param) {
      var pattern = new RegExp(  '\{(' + index + ')\}', 'g');
      return _.replace(text, pattern, param);
    }

    function replaceAllParameters(text, parameters) {
      _.forEach(parameters, function (param, index) {
        text = replaceByIndex(text, index, param);
      });

      return text;
    }


    return new StringUtility();
  }
})();
