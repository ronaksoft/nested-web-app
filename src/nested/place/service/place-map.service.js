(function () {
  'use strict';
  angular
    .module('ronak.nested.web.place')
    .service('NstSvcPlaceMap', NstSvcPlaceMap);

  /** @ngInject */
  function NstSvcPlaceMap(NstVmPlaceBadge) {

    var service = {
      toTree: toTree,
      toBadge : toPlaceBadge,
    };

    return service;

    function toTree(places, currentPlace) {

      var parentsStack = [];

      var setSuperUserLevel = function (subPlace) {
        var id = subPlace.id;

        subPlace.children = [];
        for (var i = parentsStack.length - 1; i > -1; i--) {
          if (id.indexOf(parentsStack[i]+ '.') === 0) {
            subPlace.level = i + 1;
            subPlace.parent = parentsStack[i];
            return subPlace;
          } else {
            parentsStack = _.dropRight(parentsStack)
          }
        }
        subPlace.level = 0;
        return subPlace;
      };

      var setLevel = function (subPlace) {
        subPlace = setSuperUserLevel(subPlace);
        parentsStack.push(subPlace.id);
      };


      var breedPlaces = function (places) {
        var tree = [];
        for (var i = places.length - 1; i > -1; i--) {

          if (currentPlace) {
            currentPlace.indexOf(places[i].id) === 0 ? places[i].collapse = true : places[i].collase = false;
          }


          if (places[i].level === 0) {
            tree.unshift(places[i]);
          } else {
            places.filter(function (place) {
              return place.id === places[i].parent;
            })[0].children.unshift(places[i]);
          }
          _.drop(places);
        }
        return tree;
      };


      var sortedPlaces = _.sortBy(places, ['id']);

      _.forEach(sortedPlaces, setLevel);
      return breedPlaces(sortedPlaces);

    }

    function toPlaceBadge(model, thumbnailSize) {
      return new NstVmPlaceBadge(model, 64);
    }
  }

})();
